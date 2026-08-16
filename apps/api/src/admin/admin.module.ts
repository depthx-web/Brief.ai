import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { BillingModule } from '../billing/billing.module';
import { FeaturesModule } from '../features/features.module';
import { AiModule } from '../ai/ai.module';
import { MailModule } from '../mail/mail.module';
import { CreditsModule } from '../credits/credits.module';
import { PlatformSettingsModule } from '../platform-settings/platform-settings.module';

@Module({
  imports: [BillingModule, FeaturesModule, AiModule, MailModule, CreditsModule, PlatformSettingsModule],
  controllers: [AdminController],
  providers: [AdminService, PrismaService],
})
export class AdminModule {}
