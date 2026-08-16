import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { BillingCycle, DiscountType, Plan, Segment, UserStatus } from '@prisma/client';
import { AdminAuthGuard } from './admin-auth.guard';
import { AdminService } from './admin.service';
import { PricingService } from '../billing/pricing.service';
import { FeatureService } from '../features/feature.service';
import { DiscountCodeService } from '../billing/discount-code.service';
import { LiteLlmAdminService, type TaskAlias } from '../ai/litellm-admin.service';
import { EmailCampaignService } from '../mail/email-campaign.service';
import { CreditsService } from '../credits/credits.service';
import { PlatformSettingsService } from '../platform-settings/platform-settings.service';
import { LemonSqueezyService } from '../billing/lemon-squeezy.service';
import type { CreditTransactionReason } from '@prisma/client';

const VALID_SEGMENTS: Segment[] = ['LAWYER', 'ACCOUNTANT', 'RESEARCHER'];
const VALID_CYCLES: BillingCycle[] = ['WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'];
const VALID_DISCOUNT_TYPES: DiscountType[] = ['PERCENT', 'FIXED'];
const VALID_TASK_ALIASES: TaskAlias[] = ['task-simple', 'task-complex'];

interface UpdateRoutingRuleBody {
  model?: string;
}

interface UpdateEmailCampaignBody {
  enabled?: boolean;
  subject?: string;
  body?: string;
}

interface UpdatePriceBody {
  priceCents?: number;
}

interface UpdateFeatureBody {
  freeEnabled?: boolean;
  proEnabled?: boolean;
}

interface CreateDiscountCodeBody {
  code?: string;
  type?: string;
  value?: number;
  expiresAt?: string;
  usageLimit?: number;
  applicableSegments?: string[];
}

interface CreatePackBody {
  size?: number;
  priceCents?: number;
}

interface UpdatePackBody {
  size?: number;
  priceCents?: number;
}

interface AdjustBalanceBody {
  delta?: number;
  note?: string;
}

interface UpdateSettingsBody {
  creditsEnabled?: boolean;
  paymentsEnabled?: boolean;
  commissionSignupPercent?: number;
  commissionRenewalPercent?: number;
  paypalFeePercent?: number;
  paypalFeeFixedCents?: number;
  dunningAutoRetryEnabled?: boolean;
  dunningMaxAttempts?: number;
  dunningIntervalDays?: number;
}

interface CancelSubscriptionBody {
  immediately?: boolean;
}

interface ExtendSubscriptionBody {
  renewalDate?: string;
}

@ApiTags('admin')
@UseGuards(AdminAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly pricingService: PricingService,
    private readonly featureService: FeatureService,
    private readonly discountCodeService: DiscountCodeService,
    private readonly liteLlmAdmin: LiteLlmAdminService,
    private readonly emailCampaignService: EmailCampaignService,
    private readonly creditsService: CreditsService,
    private readonly platformSettings: PlatformSettingsService,
    private readonly lemonSqueezy: LemonSqueezyService
  ) {}

  @Get('stats')
  async stats() {
    return this.adminService.getStats();
  }

  @Get('users')
  async listUsers(
    @Query('search') search?: string,
    @Query('segment') segment?: Segment,
    @Query('plan') plan?: Plan,
    @Query('status') status?: UserStatus,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string
  ) {
    return this.adminService.listUsers({
      search,
      segment,
      plan,
      status,
      page: page ? Math.max(1, parseInt(page, 10) || 1) : 1,
      pageSize: pageSize ? Math.min(100, Math.max(1, parseInt(pageSize, 10) || 25)) : 25,
    });
  }

  @Get('users/:id')
  async getUser(@Param('id') id: string) {
    const [detail, creditBalance] = await Promise.all([
      this.adminService.getUserDetail(id),
      this.creditsService.getBalance(id),
    ]);
    return { ...detail, creditBalance };
  }

  @Post('users/:id/credits/adjust')
  async adjustUserCredits(@Param('id') id: string, @Body() body: AdjustBalanceBody) {
    if (typeof body.delta !== 'number') throw new BadRequestException('An adjustment amount is required.');
    if (!body.note?.trim()) throw new BadRequestException('A reason is required.');
    await this.creditsService.adjustBalanceManually(id, body.delta, body.note);
    return { success: true };
  }

  @Post('users/:id/ban')
  async banUser(@Param('id') id: string) {
    await this.adminService.banUser(id);
    return { success: true };
  }

  @Post('users/:id/reactivate')
  async reactivateUser(@Param('id') id: string) {
    await this.adminService.reactivateUser(id);
    return { success: true };
  }

  @Post('users/:id/reset-password')
  async resetPassword(@Param('id') id: string) {
    await this.adminService.resetUserPassword(id);
    return { success: true };
  }

  // --- Subscription actions in the user detail drawer (Part 9 §2.2) ------

  @Post('users/:id/subscription/cancel')
  async cancelUserSubscription(@Param('id') id: string, @Body() body: CancelSubscriptionBody) {
    await this.lemonSqueezy.cancelSubscription(id, Boolean(body.immediately));
    return { success: true };
  }

  @Post('users/:id/subscription/extend')
  async extendUserSubscription(@Param('id') id: string, @Body() body: ExtendSubscriptionBody) {
    if (!body.renewalDate) throw new BadRequestException('A new renewal date is required.');
    const date = new Date(body.renewalDate);
    if (Number.isNaN(date.getTime())) throw new BadRequestException('Invalid date.');
    await this.lemonSqueezy.extendSubscription(id, date);
    return { success: true };
  }

  @Post('users/:id/subscription/refund')
  async refundUserPayment(@Param('id') id: string) {
    return this.lemonSqueezy.refundLastPayment(id);
  }

  @Get('plan-prices')
  async listPlanPrices() {
    return this.pricingService.listAll();
  }

  @Patch('plan-prices/:segment/:cycle')
  async updatePlanPrice(
    @Param('segment') segment: string,
    @Param('cycle') cycle: string,
    @Body() body: UpdatePriceBody
  ) {
    if (!VALID_SEGMENTS.includes(segment as Segment)) throw new BadRequestException('Invalid segment.');
    if (!VALID_CYCLES.includes(cycle as BillingCycle)) throw new BadRequestException('Invalid cycle.');
    if (typeof body.priceCents !== 'number' || body.priceCents < 0 || !Number.isInteger(body.priceCents)) {
      throw new BadRequestException('priceCents must be a non-negative integer.');
    }
    await this.pricingService.updatePrice(segment as Segment, cycle as BillingCycle, body.priceCents);
    return { success: true };
  }

  @Get('features')
  async listFeatures() {
    return this.featureService.list();
  }

  @Patch('features/:id')
  async updateFeature(@Param('id') id: string, @Body() body: UpdateFeatureBody) {
    await this.featureService.update(id, body);
    return { success: true };
  }

  @Get('discount-codes')
  async listDiscountCodes() {
    return this.discountCodeService.list();
  }

  @Post('discount-codes')
  async createDiscountCode(@Body() body: CreateDiscountCodeBody) {
    if (!body.code?.trim()) throw new BadRequestException('Code is required.');
    if (!body.type || !VALID_DISCOUNT_TYPES.includes(body.type as DiscountType)) {
      throw new BadRequestException('Invalid discount type.');
    }
    if (typeof body.value !== 'number' || body.value <= 0) {
      throw new BadRequestException('Value must be a positive number.');
    }
    const segments = (body.applicableSegments ?? []).filter((s): s is Segment =>
      VALID_SEGMENTS.includes(s as Segment)
    );
    if (segments.length === 0) throw new BadRequestException('Select at least one applicable segment.');

    return this.discountCodeService.create({
      code: body.code,
      type: body.type as DiscountType,
      value: body.value,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
      usageLimit: body.usageLimit,
      applicableSegments: segments,
    });
  }

  @Post('discount-codes/:id/revoke')
  async revokeDiscountCode(@Param('id') id: string) {
    await this.discountCodeService.revoke(id);
    return { success: true };
  }

  // --- Pay-as-you-go credit packs (extends Plans & Pricing, Part 7 §1) ----

  @Get('settings')
  async getSettings() {
    return this.platformSettings.get();
  }

  @Patch('settings')
  async updateSettings(@Body() body: UpdateSettingsBody) {
    return this.platformSettings.update(body);
  }

  @Get('credit-packs')
  async listCreditPacks() {
    return this.creditsService.listPacks();
  }

  @Post('credit-packs')
  async createCreditPack(@Body() body: CreatePackBody) {
    if (!body.size || body.size <= 0) throw new BadRequestException('Pack size must be a positive number.');
    if (typeof body.priceCents !== 'number' || body.priceCents < 0) {
      throw new BadRequestException('Price must be a non-negative number.');
    }
    await this.creditsService.createPack(body.size, body.priceCents);
    return { success: true };
  }

  @Patch('credit-packs/:id')
  async updateCreditPack(@Param('id') id: string, @Body() body: UpdatePackBody) {
    return this.creditsService.updatePack(id, body);
  }

  @Post('credit-packs/:id/best-value')
  async setBestValuePack(@Param('id') id: string) {
    await this.creditsService.setBestValue(id);
    return { success: true };
  }

  @Delete('credit-packs/:id')
  async deleteCreditPack(@Param('id') id: string) {
    await this.creditsService.deletePack(id);
    return { success: true };
  }

  @Get('credit-transactions')
  async listCreditTransactions(@Query('userId') userId?: string, @Query('reason') reason?: string) {
    return this.creditsService.listAllTransactions({
      userId,
      reason: reason as CreditTransactionReason | undefined,
    });
  }

  // --- Billing admin section (Part 9 §2.1) --------------------------------

  @Get('billing/transactions')
  async listTransactions(
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string
  ) {
    return this.adminService.listPaymentTransactions({
      status,
      type,
      page: page ? Math.max(1, parseInt(page, 10) || 1) : 1,
      pageSize: pageSize ? Math.min(100, Math.max(1, parseInt(pageSize, 10) || 25)) : 25,
    });
  }

  @Get('billing/failed-payments')
  async listFailedPayments() {
    return this.adminService.listFailedPayments();
  }

  @Post('billing/failed-payments/:userId/retry')
  async retryFailedPayment(@Param('userId') userId: string) {
    return this.lemonSqueezy.retryFailedPayment(userId);
  }

  @Get('billing/payment-provider')
  async getPaymentProvider() {
    const settings = await this.platformSettings.get();
    const apiKey = process.env.LEMON_SQUEEZY_API_KEY;
    return {
      name: 'Lemon Squeezy',
      configured: this.lemonSqueezy.isConfigured(),
      maskedKey: apiKey ? `${apiKey.slice(0, 3)}${'•'.repeat(6)}${apiKey.slice(-4)}` : null,
      enabled: settings.paymentsEnabled,
    };
  }

  @Get('ai-providers')
  async listAiProviders() {
    return {
      providers: this.liteLlmAdmin.getProviderStatuses(),
      routingRules: await this.liteLlmAdmin.listRoutingRules(),
      modelChoices: this.liteLlmAdmin.getModelChoices(),
      configured: this.liteLlmAdmin.isConfigured(),
    };
  }

  @Patch('ai-providers/routing/:alias')
  async updateRoutingRule(@Param('alias') alias: string, @Body() body: UpdateRoutingRuleBody) {
    if (!VALID_TASK_ALIASES.includes(alias as TaskAlias)) throw new BadRequestException('Invalid task alias.');
    const choice = this.liteLlmAdmin.getModelChoices().find((c) => c.model === body.model);
    if (!choice) throw new BadRequestException('Invalid model choice.');
    await this.liteLlmAdmin.setRoutingRule(alias as TaskAlias, choice.model, choice.envVar);
    return { success: true };
  }

  @Get('email-campaigns')
  async listEmailCampaigns() {
    return this.emailCampaignService.list();
  }

  @Patch('email-campaigns/:id')
  async updateEmailCampaign(@Param('id') id: string, @Body() body: UpdateEmailCampaignBody) {
    await this.emailCampaignService.update(id, body);
    return { success: true };
  }
}
