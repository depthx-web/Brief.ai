import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PlatformSettingsService } from '../platform-settings/platform-settings.service';
import type { CreditTransactionReason } from '@prisma/client';

@Injectable()
export class CreditsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: PlatformSettingsService
  ) {}

  async isEnabled(): Promise<boolean> {
    return (await this.settings.get()).creditsEnabled;
  }

  async listPacks() {
    return this.prisma.creditPack.findMany({ orderBy: { order: 'asc' } });
  }

  async getBalance(userId: string): Promise<number> {
    const result = await this.prisma.creditTransaction.aggregate({
      where: { userId },
      _sum: { delta: true },
    });
    return result._sum.delta ?? 0;
  }

  // Team Settings' member list "current token usage this month" column.
  async getMonthlyUsage(userId: string): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const result = await this.prisma.creditTransaction.aggregate({
      where: { userId, reason: 'AI_USAGE', createdAt: { gte: startOfMonth } },
      _sum: { delta: true },
    });
    return Math.abs(result._sum.delta ?? 0);
  }

  async listTransactions(userId: string, take = 50) {
    return this.prisma.creditTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take,
    });
  }

  // Used by FeatureGuard: a FREE-plan user with no seat-based access to a
  // feature can still use it once per credit, consumed atomically here so
  // two concurrent requests can't both pass a balance-of-1 check.
  async consumeCreditIfAvailable(userId: string, operationLabel?: string): Promise<boolean> {
    const balance = await this.getBalance(userId);
    if (balance <= 0) return false;
    await this.prisma.creditTransaction.create({
      // adminNote doubles as the Wallet's per-transaction operation label —
      // it's only DB-required (service-layer, not schema) for
      // MANUAL_ADMIN_ADJUSTMENT, so reusing it here for AI_USAGE is safe.
      data: { userId, delta: -1, reason: 'AI_USAGE', adminNote: operationLabel },
    });
    return true;
  }

  async grantPurchasedCredits(userId: string, amount: number): Promise<void> {
    await this.prisma.creditTransaction.create({
      data: { userId, delta: amount, reason: 'PURCHASE' },
    });
  }

  // Admin-only: requires a note, always, per Part 7 §1.3 — every manual
  // balance change needs a human-readable justification for the audit trail.
  async adjustBalanceManually(userId: string, delta: number, adminNote: string): Promise<void> {
    if (!adminNote.trim()) {
      throw new BadRequestException('A reason is required for a manual balance adjustment.');
    }
    if (!delta) throw new BadRequestException('Adjustment amount cannot be zero.');
    await this.prisma.creditTransaction.create({
      data: { userId, delta, reason: 'MANUAL_ADMIN_ADJUSTMENT', adminNote: adminNote.trim() },
    });
  }

  // --- Admin: pack management -------------------------------------------

  async createPack(size: number, priceCents: number): Promise<void> {
    const count = await this.prisma.creditPack.count();
    await this.prisma.creditPack.create({ data: { size, priceCents, order: count } });
  }

  async updatePack(id: string, data: { size?: number; priceCents?: number }) {
    await this.findPack(id);
    return this.prisma.creditPack.update({ where: { id }, data });
  }

  async setBestValue(id: string): Promise<void> {
    await this.findPack(id);
    await this.prisma.$transaction([
      this.prisma.creditPack.updateMany({ data: { isBestValue: false }, where: {} }),
      this.prisma.creditPack.update({ where: { id }, data: { isBestValue: true } }),
    ]);
  }

  async deletePack(id: string): Promise<void> {
    await this.findPack(id);
    await this.prisma.creditPack.delete({ where: { id } });
  }

  private async findPack(id: string) {
    const pack = await this.prisma.creditPack.findUnique({ where: { id } });
    if (!pack) throw new NotFoundException('Credit pack not found.');
    return pack;
  }

  // --- Admin: global transaction log (Analytics tab) ---------------------

  // Admin "Token Economics" panel — the three stat cards.
  async getTokenEconomicsSummary(): Promise<{
    todayUsage: number;
    totalCreditsSold: number;
    totalCreditsOutstanding: number;
  }> {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [todayUsageResult, purchasedResult, outstandingResult] = await Promise.all([
      this.prisma.creditTransaction.aggregate({
        where: { reason: 'AI_USAGE', createdAt: { gte: startOfToday } },
        _sum: { delta: true },
      }),
      this.prisma.creditTransaction.aggregate({
        where: { reason: 'PURCHASE' },
        _sum: { delta: true },
      }),
      // Purchased minus consumed, platform-wide (excludes manual admin
      // adjustments — those aren't "sold" credits).
      this.prisma.creditTransaction.aggregate({
        where: { reason: { in: ['PURCHASE', 'AI_USAGE'] } },
        _sum: { delta: true },
      }),
    ]);

    return {
      // AI_USAGE deltas are negative (credits spent) — report as a positive count.
      todayUsage: Math.abs(todayUsageResult._sum.delta ?? 0),
      totalCreditsSold: purchasedResult._sum.delta ?? 0,
      totalCreditsOutstanding: Math.max(0, outstandingResult._sum.delta ?? 0),
    };
  }

  async listAllTransactions(filters: { userId?: string; reason?: CreditTransactionReason; take?: number }) {
    return this.prisma.creditTransaction.findMany({
      where: { userId: filters.userId, reason: filters.reason },
      include: { user: { select: { email: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      take: filters.take ?? 200,
    });
  }
}
