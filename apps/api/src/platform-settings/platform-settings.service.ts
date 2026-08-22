import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const SETTINGS_ID = 'singleton';

// One row, always the same id — shared by the credits system
// (creditsEnabled) and the affiliate program (commission/PayPal fee rates),
// both admin-editable without a code change.
@Injectable()
export class PlatformSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get() {
    return this.prisma.platformSettings.upsert({
      where: { id: SETTINGS_ID },
      update: {},
      create: { id: SETTINGS_ID },
    });
  }

  async update(data: {
    creditsEnabled?: boolean;
    paymentsEnabled?: boolean;
    commissionSignupPercent?: number;
    commissionRenewalPercent?: number;
    paypalFeePercent?: number;
    paypalFeeFixedCents?: number;
    dunningAutoRetryEnabled?: boolean;
    dunningMaxAttempts?: number;
    dunningIntervalDays?: number;
    tokensPerDollar?: number;
    homepageStatsDemoMode?: boolean;
  }) {
    await this.get();
    return this.prisma.platformSettings.update({ where: { id: SETTINGS_ID }, data });
  }
}
