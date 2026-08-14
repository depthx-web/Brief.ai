import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { DiscountCodeService } from '../billing/discount-code.service';
import { EmailCampaignService } from './email-campaign.service';
import type { Segment } from '@prisma/client';

const WIN_BACK_WAIT_DAYS = 14;
const ALL_SEGMENTS: Segment[] = ['LAWYER', 'ACCOUNTANT', 'RESEARCHER'];

// Scans daily for accounts that cancelled >= WIN_BACK_WAIT_DAYS ago and
// haven't been sent a win-back email yet, mints each a single-use 20% code
// via the discount-code system, and emails it.
@Injectable()
export class WinBackService {
  private readonly logger = new Logger(WinBackService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly discountCodes: DiscountCodeService,
    private readonly emailCampaigns: EmailCampaignService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendPendingWinBackEmails(): Promise<void> {
    const cutoff = new Date(Date.now() - WIN_BACK_WAIT_DAYS * 24 * 60 * 60 * 1000);
    const candidates = await this.prisma.user.findMany({
      where: { subscriptionCancelledAt: { lte: cutoff }, winBackEmailSentAt: null },
    });

    for (const user of candidates) {
      try {
        const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
        const code = await this.discountCodes.create({
          code: `WINBACK-${suffix}`,
          type: 'PERCENT',
          value: 20,
          usageLimit: 1,
          applicableSegments: user.segment ? [user.segment] : ALL_SEGMENTS,
        });
        await this.emailCampaigns.sendWinBack(user.email, user.name, code.code);
        await this.prisma.user.update({ where: { id: user.id }, data: { winBackEmailSentAt: new Date() } });
      } catch (err) {
        this.logger.error(
          `Win-back email failed for user ${user.id}: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }
  }
}
