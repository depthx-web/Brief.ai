import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { BillingCycle, DiscountType, Plan, Segment, UserStatus } from '@prisma/client';
import { AdminAuthGuard } from './admin-auth.guard';
import { AdminService } from './admin.service';
import { PricingService } from '../billing/pricing.service';
import { FeatureService } from '../features/feature.service';
import { DiscountCodeService } from '../billing/discount-code.service';
import { LiteLlmAdminService, type TaskAlias } from '../ai/litellm-admin.service';
import { EmailCampaignService } from '../mail/email-campaign.service';

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
    private readonly emailCampaignService: EmailCampaignService
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
    return this.adminService.getUserDetail(id);
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
