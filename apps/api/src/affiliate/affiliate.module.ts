import { Module } from '@nestjs/common';
import { AffiliateService } from './affiliate.service';
import { AffiliateController } from './affiliate.controller';
import { AffiliateAdminController } from './affiliate-admin.controller';
import { PrismaService } from '../prisma/prisma.service';
import { PlatformSettingsModule } from '../platform-settings/platform-settings.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PlatformSettingsModule, MailModule],
  controllers: [AffiliateController, AffiliateAdminController],
  providers: [AffiliateService, PrismaService],
  exports: [AffiliateService],
})
export class AffiliateModule {}
