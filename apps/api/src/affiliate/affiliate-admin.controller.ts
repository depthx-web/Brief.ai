import { BadRequestException, Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminAuthGuard } from '../admin/admin-auth.guard';
import { AffiliateService } from './affiliate.service';

interface ConfirmPayoutBody {
  transactionReference?: string;
}

interface MarkPaidBody {
  transactionReference?: string;
}

@ApiTags('admin')
@UseGuards(AdminAuthGuard)
@Controller('admin/affiliate')
export class AffiliateAdminController {
  constructor(private readonly affiliateService: AffiliateService) {}

  @Get('list')
  async list() {
    return this.affiliateService.adminListAffiliates();
  }

  @Get(':userId')
  async detail(@Param('userId') userId: string) {
    return this.affiliateService.adminGetAffiliateDetail(userId);
  }

  @Post(':userId/block')
  async block(@Param('userId') userId: string) {
    await this.affiliateService.blockAffiliate(userId);
    return { success: true };
  }

  @Delete(':userId')
  async deleteData(@Param('userId') userId: string) {
    await this.affiliateService.deleteAffiliateData(userId);
    return { success: true };
  }

  @Post(':userId/mark-paid')
  async markPaid(@Param('userId') userId: string, @Body() body: MarkPaidBody) {
    if (!body.transactionReference?.trim()) throw new BadRequestException('A transaction reference is required.');
    return this.affiliateService.markLatestPendingPayoutPaid(userId, body.transactionReference);
  }

  @Get('payouts/all')
  async listPayouts() {
    return this.affiliateService.adminListPayoutRequests();
  }

  @Post('payouts/:id/confirm')
  async confirmPayout(@Param('id') id: string, @Body() body: ConfirmPayoutBody) {
    if (!body.transactionReference?.trim()) throw new BadRequestException('A transaction reference is required.');
    return this.affiliateService.confirmPayout(id, body.transactionReference);
  }

  @Get('leaderboard/top')
  async leaderboard() {
    return this.affiliateService.leaderboard();
  }
}
