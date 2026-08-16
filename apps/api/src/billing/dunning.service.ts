import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { PlatformSettingsService } from '../platform-settings/platform-settings.service';
import { LemonSqueezyService } from './lemon-squeezy.service';

// Automatic retry side of dunning (Part 9 §2.1's "Automatic retry" toggle +
// attempt/interval settings). Checks in once a day on any user whose next
// retry is due, up to the admin-configured attempt cap — after that, the
// account simply stays on whatever status Lemon Squeezy last reported, same
// as if automatic retry were off, since forcing a downgrade isn't asked for
// by the spec (subscription_expired already handles that path).
@Injectable()
export class DunningService {
  private readonly logger = new Logger(DunningService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly platformSettings: PlatformSettingsService,
    private readonly lemonSqueezy: LemonSqueezyService
  ) {}

  @Cron('0 8 * * *')
  async retryDuePayments(): Promise<void> {
    const settings = await this.platformSettings.get();
    if (!settings.dunningAutoRetryEnabled) return;

    const due = await this.prisma.user.findMany({
      where: {
        dunningAttemptCount: { gt: 0, lt: settings.dunningMaxAttempts },
        nextDunningRetryAt: { lte: new Date() },
      },
      select: { id: true },
    });

    for (const user of due) {
      try {
        await this.lemonSqueezy.retryFailedPayment(user.id);
      } catch (err) {
        this.logger.warn(`Dunning retry failed for user ${user.id}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }
}
