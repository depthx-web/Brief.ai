import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BillingController } from './billing.controller';
import { LemonSqueezyService } from './lemon-squeezy.service';
import { PricingService } from './pricing.service';
import { DiscountCodeService } from './discount-code.service';
import { DunningService } from './dunning.service';
import { MailModule } from '../mail/mail.module';
import { CreditsModule } from '../credits/credits.module';
import { PlatformSettingsModule } from '../platform-settings/platform-settings.module';
import { AffiliateModule } from '../affiliate/affiliate.module';

@Module({
  imports: [MailModule, CreditsModule, PlatformSettingsModule, AffiliateModule],
  controllers: [BillingController],
  providers: [LemonSqueezyService, PricingService, DiscountCodeService, DunningService, PrismaService],
  exports: [LemonSqueezyService, PricingService, DiscountCodeService],
})
export class BillingModule {}
