import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  Res,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthService, Segment } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';
import type { SafeUser } from './auth.service';

const APP_URL = process.env.APP_URL ?? 'http://localhost:3000';
const API_PUBLIC_URL = process.env.API_PUBLIC_URL ?? 'http://localhost:3001';

const VALID_SEGMENTS: Segment[] = ['LAWYER', 'ACCOUNTANT', 'RESEARCHER'];
// 24h / 7 days / 30 days / Never — the only options Settings exposes.
const VALID_RETENTION_HOURS = [0, 24, 24 * 7, 24 * 30];

interface SignupBody {
  email?: string;
  password?: string;
  name?: string;
  segment?: string;
  referralCode?: string;
}

interface LoginBody {
  email?: string;
  password?: string;
}

interface UpdateProfileBody {
  name?: string;
  segment?: string;
  defaultRetentionHours?: number | null;
}

interface ChangePasswordBody {
  currentPassword?: string;
  newPassword?: string;
}

interface ChangeEmailBody {
  newEmail?: string;
  currentPassword?: string;
}

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() body: SignupBody) {
    if (!body.email?.trim() || !body.password) {
      throw new BadRequestException('Email and password are required.');
    }
    if (body.password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters.');
    }
    const segment =
      body.segment && VALID_SEGMENTS.includes(body.segment as Segment)
        ? (body.segment as Segment)
        : undefined;

    return this.authService.signup(
      body.email.trim().toLowerCase(),
      body.password,
      body.name,
      segment,
      body.referralCode?.trim() || undefined
    );
  }

  @Post('login')
  async login(@Body() body: LoginBody) {
    if (!body.email?.trim() || !body.password) {
      throw new BadRequestException('Email and password are required.');
    }
    return this.authService.login(body.email.trim().toLowerCase(), body.password);
  }

  @Get('google')
  googleStart(@Res() res: Response) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) throw new ServiceUnavailableException('Google sign-in is not configured yet.');

    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', `${API_PUBLIC_URL}/auth/google/callback`);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'openid email profile');
    url.searchParams.set('access_type', 'online');
    url.searchParams.set('prompt', 'select_account');
    res.redirect(url.toString());
  }

  @Get('google/callback')
  async googleCallback(@Query('code') code: string | undefined, @Res() res: Response) {
    if (!code) return res.redirect(`${APP_URL}/login?error=google_failed`);
    try {
      const { token } = await this.authService.completeGoogleLogin(code);
      res.redirect(`${APP_URL}/google/complete?token=${encodeURIComponent(token)}`);
    } catch {
      res.redirect(`${APP_URL}/login?error=google_failed`);
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: SafeUser) {
    return user;
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateMe(@CurrentUser() user: SafeUser, @Body() body: UpdateProfileBody) {
    const segment =
      body.segment && VALID_SEGMENTS.includes(body.segment as Segment)
        ? (body.segment as Segment)
        : undefined;
    const defaultRetentionHours =
      body.defaultRetentionHours === null
        ? null
        : body.defaultRetentionHours !== undefined && VALID_RETENTION_HOURS.includes(body.defaultRetentionHours)
          ? body.defaultRetentionHours
          : undefined;
    return this.authService.updateProfile(user.id, {
      name: body.name?.trim() || undefined,
      segment,
      defaultRetentionHours,
    });
  }

  @Patch('me/password')
  @UseGuards(JwtAuthGuard)
  async changePassword(@CurrentUser() user: SafeUser, @Body() body: ChangePasswordBody) {
    if (!body.currentPassword || !body.newPassword) {
      throw new BadRequestException('Current and new password are required.');
    }
    await this.authService.changePassword(user.id, body.currentPassword, body.newPassword);
    return { success: true };
  }

  @Patch('me/email')
  @UseGuards(JwtAuthGuard)
  async changeEmail(@CurrentUser() user: SafeUser, @Body() body: ChangeEmailBody) {
    if (!body.newEmail?.trim() || !body.currentPassword) {
      throw new BadRequestException('New email and current password are required.');
    }
    return this.authService.changeEmail(user.id, body.newEmail.trim().toLowerCase(), body.currentPassword);
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  async deleteMe(@CurrentUser() user: SafeUser) {
    await this.authService.deleteAccount(user.id);
    return { success: true };
  }
}
