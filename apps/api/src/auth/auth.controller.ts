import { BadRequestException, Body, Controller, Delete, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService, Segment } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';
import type { SafeUser } from './auth.service';

const VALID_SEGMENTS: Segment[] = ['LAWYER', 'ACCOUNTANT', 'RESEARCHER'];

interface SignupBody {
  email?: string;
  password?: string;
  name?: string;
  segment?: string;
}

interface LoginBody {
  email?: string;
  password?: string;
}

interface UpdateProfileBody {
  name?: string;
  segment?: string;
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

    return this.authService.signup(body.email.trim().toLowerCase(), body.password, body.name, segment);
  }

  @Post('login')
  async login(@Body() body: LoginBody) {
    if (!body.email?.trim() || !body.password) {
      throw new BadRequestException('Email and password are required.');
    }
    return this.authService.login(body.email.trim().toLowerCase(), body.password);
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
    return this.authService.updateProfile(user.id, {
      name: body.name?.trim() || undefined,
      segment,
    });
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  async deleteMe(@CurrentUser() user: SafeUser) {
    await this.authService.deleteAccount(user.id);
    return { success: true };
  }
}
