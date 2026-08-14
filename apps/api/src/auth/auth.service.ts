import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { EmailCampaignService } from '../mail/email-campaign.service';

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
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly storage: StorageService,
    private readonly emailCampaigns: EmailCampaignService
  ) {}

  async signup(email: string, password: string, name?: string, segment?: Segment) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('An account with this email already exists.');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { email, passwordHash, name, segment },
    });

    // Fire-and-forget: a slow/failed welcome email shouldn't fail signup itself.
    this.emailCampaigns.sendWelcome(user.email, user.name).catch(() => {});

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

  async updateProfile(id: string, data: { name?: string; segment?: Segment }): Promise<SafeUser> {
    const user = await this.prisma.user.update({ where: { id }, data });
    return this.toSafeUser(user);
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
  }): SafeUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      segment: user.segment,
      plan: user.plan,
      billingCycle: user.billingCycle,
    };
  }
}
