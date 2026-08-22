import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { EmailCampaignService } from '../mail/email-campaign.service';

const WARNING_WINDOW_START_MS = 55 * 60 * 1000;
const WARNING_WINDOW_END_MS = 65 * 60 * 1000;
// The free-tier default retention is itself only 1 hour (library.service.ts)
// — a document on that tier hits the 55-65 minute warning window almost the
// instant it's uploaded, so "1 hour before deletion" would tell the user
// nothing they don't already know. Only send it to documents whose total
// lifetime gives that advance notice room to mean something (the 7-day/
// 30-day "extend retention" tiers).
const MIN_TOTAL_RETENTION_FOR_WARNING_MS = 2 * 60 * 60 * 1000;

// "1 hour before deletion" email (automated email system) — checks every 10
// minutes for files landing in a 55-65 minute window so a 10-minute cadence
// can't skip past a file entirely between runs. retentionWarningSent
// dedupes so a file sitting in the window across two runs isn't emailed
// twice.
@Injectable()
export class RetentionWarningService {
  private readonly logger = new Logger(RetentionWarningService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailCampaigns: EmailCampaignService
  ) {}

  @Cron('*/10 * * * *')
  async sendWarnings(): Promise<void> {
    const now = Date.now();
    const documents = await this.prisma.libraryDocument.findMany({
      where: {
        retentionWarningSent: false,
        expiresAt: {
          gte: new Date(now + WARNING_WINDOW_START_MS),
          lte: new Date(now + WARNING_WINDOW_END_MS),
        },
      },
      select: { id: true, filename: true, createdAt: true, expiresAt: true, user: { select: { email: true, name: true } } },
    });

    for (const doc of documents) {
      if (!doc.expiresAt || doc.expiresAt.getTime() - doc.createdAt.getTime() < MIN_TOTAL_RETENTION_FOR_WARNING_MS) {
        // Short (1h-tier) retention — mark handled without emailing, so the
        // sweep never re-checks it every 10 minutes for the rest of its life.
        await this.prisma.libraryDocument.update({ where: { id: doc.id }, data: { retentionWarningSent: true } });
        continue;
      }
      try {
        await this.emailCampaigns.sendRetentionWarning(doc.user.email, doc.user.name, doc.filename);
        await this.prisma.libraryDocument.update({ where: { id: doc.id }, data: { retentionWarningSent: true } });
      } catch (err) {
        this.logger.error(
          `Retention warning failed for document ${doc.id}: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }
  }
}
