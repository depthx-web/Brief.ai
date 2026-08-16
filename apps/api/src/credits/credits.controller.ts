import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { SafeUser } from '../auth/auth.service';
import { CreditsService } from './credits.service';

// Checkout initiation lives on BillingController (POST /billing/credit-
// checkout) rather than here — it needs LemonSqueezyService, and importing
// BillingModule here would create a circular dependency (see credits.module.ts).
@ApiTags('credits')
@Controller('credits')
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) {}

  @Get('enabled')
  async enabled() {
    return { enabled: await this.creditsService.isEnabled() };
  }

  @Get('packs')
  async packs() {
    return this.creditsService.listPacks();
  }

  @Get('balance')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async balance(@CurrentUser() user: SafeUser) {
    return { balance: await this.creditsService.getBalance(user.id) };
  }

  @Get('transactions')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async transactions(@CurrentUser() user: SafeUser) {
    return this.creditsService.listTransactions(user.id);
  }
}
