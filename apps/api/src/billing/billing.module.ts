import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BillingController } from './billing.controller';
import { LemonSqueezyService } from './lemon-squeezy.service';
import { PricingService } from './pricing.service';
import { DiscountCodeService } from './discount-code.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [MailModule],
  controllers: [BillingController],
  providers: [LemonSqueezyService, PricingService, DiscountCodeService, PrismaService],
  exports: [LemonSqueezyService, PricingService, DiscountCodeService],
})
export class BillingModule {}
