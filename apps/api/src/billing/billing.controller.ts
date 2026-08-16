import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  NotFoundException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { SafeUser } from '../auth/auth.service';
import { LemonSqueezyService } from './lemon-squeezy.service';
import { PricingService } from './pricing.service';
import type { BillingCycle } from './pricing';
import { PrismaService } from '../prisma/prisma.service';

const VALID_CYCLES: BillingCycle[] = ['WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'];

interface CheckoutBody {
  cycle?: string;
  code?: string;
}

interface CreditCheckoutBody {
  packId?: string;
}

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(
    private readonly lemonSqueezy: LemonSqueezyService,
    private readonly pricing: PricingService,
    private readonly prisma: PrismaService
  ) {}

  @Get('plans')
  async plans() {
    return { plans: await this.pricing.getMatrix(), configured: this.lemonSqueezy.isConfigured() };
  }

  @Post('checkout')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async checkout(@CurrentUser() user: SafeUser, @Body() body: CheckoutBody) {
    if (!user.segment) {
      throw new BadRequestException('Choose a workspace (Lawyer / Accountant / Researcher) before checking out.');
    }
    const cycle = body.cycle as BillingCycle;
    if (!VALID_CYCLES.includes(cycle)) {
      throw new BadRequestException('Invalid billing cycle.');
    }
    const url = await this.lemonSqueezy.createCheckoutUrl(
      user.id,
      user.email,
      user.segment,
      cycle,
      body.code
    );
    return { url };
  }

  @Post('credit-checkout')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async creditCheckout(@CurrentUser() user: SafeUser, @Body() body: CreditCheckoutBody) {
    if (!body.packId) throw new BadRequestException('A credit pack is required.');
    const pack = await this.prisma.creditPack.findUnique({ where: { id: body.packId } });
    if (!pack) throw new NotFoundException('Credit pack not found.');
    if (!pack.lemonSqueezyVariantId) {
      throw new BadRequestException('This credit pack is not yet available for purchase.');
    }
    const url = await this.lemonSqueezy.createCreditPackCheckoutUrl(
      user.id,
      user.email,
      pack.id,
      pack.size,
      pack.lemonSqueezyVariantId
    );
    return { url };
  }

  // Raw body is captured by the `verify` hook on the global JSON body parser
  // in main.ts — required because Lemon Squeezy signs the exact request
  // bytes, not the re-serialized JSON.
  @Post('webhook')
  async webhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers('x-signature') signature: string | undefined
  ) {
    const rawBody = req.rawBody;
    if (!rawBody || !this.lemonSqueezy.verifySignature(rawBody, signature)) {
      throw new BadRequestException('Invalid webhook signature.');
    }
    const payload = this.lemonSqueezy.parseWebhookBody(rawBody);
    await this.lemonSqueezy.handleWebhookEvent(payload);
    return { received: true };
  }
}
