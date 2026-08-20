import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { EmailCampaignService } from '../mail/email-campaign.service';
import { AffiliateService } from '../affiliate/affiliate.service';

const API_PUBLIC_URL = process.env.API_PUBLIC_URL ?? 'http://localhost:3001';

interface GoogleIdTokenPayload {
  email?: string;
  email_verified?: boolean;
  name?: string;
}

export type Segment = 'LAWYER' | 'ACCOUNTANT' | 'RESEARCHER';
export type Plan = 'FREE' | 'PAID';
export type BillingCycle = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export interface SafeUser {
  id: string;
  email: string;
  name: string | null;
  segment: Segment | null;
  plan: Plan;
  billingCycle: BillingCycle | null;
  // Null = platform default (24h). 0 = "Never" (paid plans only).
  defaultRetentionHours: number | null;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly storage: StorageService,
    private readonly emailCampaigns: EmailCampaignService,
    private readonly affiliateService: AffiliateService
  ) {}

  async signup(email: string, password: string, name?: string, segment?: Segment, referralCode?: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('An account with this email already exists.');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { email, passwordHash, name, segment },
    });

    // Fire-and-forget: a slow/failed welcome email shouldn't fail signup itself.
    this.emailCampaigns.sendWelcome(user.email, user.name).catch(() => {});
    if (referralCode) {
      await this.affiliateService.attachReferral(user.id, referralCode).catch(() => {});
    }

    return this.buildAuthResponse(user);
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid email or password.');

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) throw new UnauthorizedException('Invalid email or password.');
    if (user.status === 'BANNED') throw new UnauthorizedException('This account has been suspended.');

    return this.buildAuthResponse(user);
  }

  // Re-checked on every authenticated request (via JwtStrategy), not just at
  // login — a ban must kill an already-issued token immediately, not merely
  // block future logins.
  async findById(id: string): Promise<SafeUser | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user || user.status === 'BANNED') return null;
    return this.toSafeUser(user);
  }

  // Segment (professional workspace) is chosen once at signup and is
  // permanent from then on — only set it here if the account doesn't
  // already have one. Plan/billing changes go through a separate flow.
  async updateProfile(
    id: string,
    data: { name?: string; segment?: Segment; defaultRetentionHours?: number | null }
  ): Promise<SafeUser> {
    const current = await this.prisma.user.findUniqueOrThrow({ where: { id } });
    // "Never" (0) is a paid-plan-only option — silently ignore the request
    // rather than error, same fail-safe posture as the segment-lock above.
    const defaultRetentionHours =
      data.defaultRetentionHours === undefined
        ? undefined
        : data.defaultRetentionHours === 0 && current.plan !== 'PAID'
          ? undefined
          : data.defaultRetentionHours;
    const user = await this.prisma.user.update({
      where: { id },
      data: { name: data.name, segment: current.segment ? undefined : data.segment, defaultRetentionHours },
    });
    return this.toSafeUser(user);
  }

  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id } });
    const matches = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!matches) throw new BadRequestException('Current password is incorrect.');
    if (newPassword.length < 8) throw new BadRequestException('New password must be at least 8 characters.');

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({ where: { id }, data: { passwordHash } });

    // Fire-and-forget: a slow/failed alert shouldn't fail the password change itself.
    this.emailCampaigns.sendSecurityAlert(user.email, user.name, 'password').catch(() => {});
  }

  async changeEmail(id: string, newEmail: string, currentPassword: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id } });
    const matches = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!matches) throw new BadRequestException('Current password is incorrect.');

    const existing = await this.prisma.user.findUnique({ where: { email: newEmail } });
    if (existing && existing.id !== id) throw new ConflictException('An account with this email already exists.');

    const oldEmail = user.email;
    const updated = await this.prisma.user.update({ where: { id }, data: { email: newEmail } });

    // Notify the OLD address — if this change wasn't authorized, that's the inbox that needs to know.
    this.emailCampaigns.sendSecurityAlert(oldEmail, user.name, 'email').catch(() => {});

    return this.toSafeUser(updated);
  }

  // Manual code exchange rather than a passport-google-oauth20 strategy —
  // avoids an extra dependency for what's a single server-to-server POST.
  // The id_token is trusted without JWKS verification because it comes
  // straight from Google's token endpoint over HTTPS, not from the client.
  async completeGoogleLogin(code: string) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) throw new BadRequestException('Google sign-in is not configured.');

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${API_PUBLIC_URL}/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });
    if (!tokenResponse.ok) throw new UnauthorizedException('Could not complete Google sign-in.');
    const { id_token } = (await tokenResponse.json()) as { id_token?: string };
    if (!id_token) throw new UnauthorizedException('Could not complete Google sign-in.');

    const payloadJson = Buffer.from(id_token.split('.')[1], 'base64url').toString('utf8');
    const payload = JSON.parse(payloadJson) as GoogleIdTokenPayload;
    if (!payload.email || !payload.email_verified) {
      throw new UnauthorizedException('Google account has no verified email.');
    }

    let user = await this.prisma.user.findUnique({ where: { email: payload.email } });
    if (!user) {
      const passwordHash = await bcrypt.hash(randomBytes(32).toString('hex'), 10);
      user = await this.prisma.user.create({
        data: { email: payload.email, passwordHash, name: payload.name },
      });
      this.emailCampaigns.sendWelcome(user.email, user.name).catch(() => {});
    }
    if (user.status === 'BANNED') throw new UnauthorizedException('This account has been suspended.');

    return this.buildAuthResponse(user);
  }

  async deleteAccount(id: string): Promise<void> {
    const documents = await this.prisma.libraryDocument.findMany({
      where: { userId: id },
      select: { storagePath: true },
    });
    await Promise.all(documents.map((d) => this.storage.delete(d.storagePath)));
    // LibraryDocument rows cascade-delete automatically (onDelete: Cascade in schema).
    await this.prisma.user.delete({ where: { id } });
  }

  private buildAuthResponse(user: {
    id: string;
    email: string;
    name: string | null;
    segment: Segment | null;
    plan: Plan;
    billingCycle: BillingCycle | null;
    defaultRetentionHours?: number | null;
  }) {
    const safeUser = this.toSafeUser(user);
    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return { token, user: safeUser };
  }

  private toSafeUser(user: {
    id: string;
    email: string;
    name: string | null;
    segment: Segment | null;
    plan: Plan;
    billingCycle: BillingCycle | null;
    defaultRetentionHours?: number | null;
  }): SafeUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      segment: user.segment,
      plan: user.plan,
      billingCycle: user.billingCycle,
      defaultRetentionHours: user.defaultRetentionHours ?? null,
    };
  }
}
