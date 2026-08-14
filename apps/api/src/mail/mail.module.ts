import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from './mail.service';
import { EmailCampaignService } from './email-campaign.service';

// Deliberately has no dependency on BillingModule — WinBackService needs
// both mail and billing (discount codes), so it lives in its own module
// instead, to avoid a MailModule <-> BillingModule import cycle.
@Module({
  providers: [MailService, EmailCampaignService, PrismaService],
  exports: [MailService, EmailCampaignService],
})
export class MailModule {}
