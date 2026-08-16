import { BadRequestException, Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { SafeUser } from '../auth/auth.service';
import { AffiliateService } from './affiliate.service';
import type { PayoutMethod } from '@prisma/client';

interface RequestPayoutBody {
  method?: string;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  paypalEmail?: string;
}

const VALID_METHODS: PayoutMethod[] = ['BANK_TRANSFER', 'PAYPAL'];

@ApiTags('affiliate')
@Controller('affiliate')
export class AffiliateController {
  constructor(private readonly affiliateService: AffiliateService) {}

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: SafeUser) {
    const [stats, referrals, payouts] = await Promise.all([
      this.affiliateService.getStats(user.id),
      this.affiliateService.listReferrals(user.id),
      this.affiliateService.listPayoutRequests(user.id),
    ]);
    return { ...stats, referrals, payouts };
  }

  @Post('payout')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async requestPayout(@CurrentUser() user: SafeUser, @Body() body: RequestPayoutBody) {
    if (!body.method || !VALID_METHODS.includes(body.method as PayoutMethod)) {
      throw new BadRequestException('Choose a withdrawal method.');
    }
    const method = body.method as PayoutMethod;
    if (method === 'BANK_TRANSFER') {
      if (!body.bankName?.trim() || !body.accountNumber?.trim() || !body.accountHolder?.trim()) {
        throw new BadRequestException('Bank name, account number, and account holder are required.');
      }
      return this.affiliateService.requestPayout(user.id, method, {
        bankName: body.bankName,
        accountNumber: body.accountNumber,
        accountHolder: body.accountHolder,
      });
    }
    if (!body.paypalEmail?.trim()) throw new BadRequestException('A PayPal email is required.');
    return this.affiliateService.requestPayout(user.id, method, { paypalEmail: body.paypalEmail });
  }

  // Public — fired client-side on a marketing page load with ?ref=CODE.
  @Post('click/:code')
  async trackClick(@Param('code') code: string) {
    await this.affiliateService.trackClick(code);
    return { success: true };
  }
}
