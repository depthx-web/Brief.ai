import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { PlatformSettingsService } from '../platform-settings/platform-settings.service';
import type { PayoutMethod } from '@prisma/client';

const APP_URL = process.env.APP_URL ?? 'http://localhost:3000';

function generateCode(): string {
  return randomBytes(5).toString('base64url').replace(/[^a-zA-Z0-9]/g, '').slice(0, 7).toLowerCase();
}

@Injectable()
export class AffiliateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly platformSettings: PlatformSettingsService
  ) {}

  async getOrCreateLink(userId: string) {
    const existing = await this.prisma.affiliateLink.findUnique({ where: { userId } });
    if (existing) return existing;

    // Retry on the rare code collision rather than pre-checking — codes are
    // 7 chars of base62-ish alphabet, collisions are vanishingly unlikely.
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        return await this.prisma.affiliateLink.create({ data: { userId, code: generateCode() } });
      } catch {
        // unique constraint hit — try again with a new code
      }
    }
    throw new BadRequestException('Could not generate a referral link. Please try again.');
  }

  // Public: every visit to a referral link (?ref=CODE on the marketing
  // site), before any signup (Part 9 §4.3). Silently no-ops for an unknown
  // or blocked code — a blocked link's visitors just see the normal site,
  // no error surfaced to them.
  async trackClick(code: string): Promise<void> {
    const link = await this.prisma.affiliateLink.findUnique({ where: { code } });
    if (!link || link.status === 'BLOCKED') return;
    await this.prisma.clickEvent.create({ data: { affiliateLinkId: link.id } });
  }

  // Called once at signup if a referral code was captured client-side.
  // Silently no-ops on any invalid state (unknown/blocked code, or the code
  // somehow belonging to the new user themselves) rather than failing
  // signup over a referral-attribution detail.
  async attachReferral(newUserId: string, code: string): Promise<void> {
    const link = await this.prisma.affiliateLink.findUnique({ where: { code } });
    if (!link || link.status === 'BLOCKED' || link.userId === newUserId) return;
    await this.prisma.user.update({ where: { id: newUserId }, data: { referredByUserId: link.userId } });
  }

  // Awards a commission on a referred user's payment (Part 9 §4.3). Single
  // source of truth for both SIGNUP and RENEWAL commissions — called only
  // from the subscription_payment_success webhook handler, which determines
  // the type itself by checking whether this is the referred user's first
  // successful subscription payment. Skips entirely if the referrer's link
  // has since been blocked (existing balance stays payable regardless — see
  // AffiliateAdminController.block).
  async awardCommission(referredUserId: string, type: 'SIGNUP' | 'RENEWAL', paymentAmountCents: number): Promise<void> {
    const referred = await this.prisma.user.findUnique({ where: { id: referredUserId } });
    if (!referred?.referredByUserId) return;

    const link = await this.prisma.affiliateLink.findUnique({ where: { userId: referred.referredByUserId } });
    if (!link || link.status === 'BLOCKED') return;

    const settings = await this.platformSettings.get();
    const percent = type === 'SIGNUP' ? settings.commissionSignupPercent : settings.commissionRenewalPercent;
    const amountCents = Math.round((paymentAmountCents * percent) / 100);
    if (amountCents <= 0) return;

    await this.prisma.commission.create({
      data: { referrerUserId: referred.referredByUserId, referredUserId, type, amountCents },
    });
  }

  async hasEarnedSignupCommission(referredUserId: string): Promise<boolean> {
    const count = await this.prisma.commission.count({ where: { referredUserId, type: 'SIGNUP' } });
    return count > 0;
  }

  private async totalEarnings(userId: string): Promise<number> {
    const result = await this.prisma.commission.aggregate({ where: { referrerUserId: userId }, _sum: { amountCents: true } });
    return result._sum.amountCents ?? 0;
  }

  private async totalRequested(userId: string): Promise<number> {
    const result = await this.prisma.payoutRequest.aggregate({ where: { userId }, _sum: { amountCents: true } });
    return result._sum.amountCents ?? 0;
  }

  async getWithdrawableBalance(userId: string): Promise<number> {
    const [earned, requested] = await Promise.all([this.totalEarnings(userId), this.totalRequested(userId)]);
    return Math.max(0, earned - requested);
  }

  async getStats(userId: string) {
    const link = await this.getOrCreateLink(userId);
    const [clickCount, referralCount, totalEarnings, monthEarnings, withdrawable] = await Promise.all([
      this.prisma.clickEvent.count({ where: { affiliateLinkId: link.id } }),
      this.prisma.commission.findMany({ where: { referrerUserId: userId, type: 'SIGNUP' }, distinct: ['referredUserId'] }),
      this.totalEarnings(userId),
      this.prisma.commission.aggregate({
        where: { referrerUserId: userId, createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
        _sum: { amountCents: true },
      }),
      this.getWithdrawableBalance(userId),
    ]);

    return {
      referralLink: `${APP_URL}/?ref=${link.code}`,
      clicks: clickCount,
      successfulReferrals: referralCount.length,
      earningsThisMonthCents: monthEarnings._sum.amountCents ?? 0,
      totalEarningsCents: totalEarnings,
      withdrawableBalanceCents: withdrawable,
    };
  }

  async listReferrals(userId: string) {
    const referred = await this.prisma.user.findMany({
      where: { referredByUserId: userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, name: true, createdAt: true, plan: true, subscriptionStatus: true },
    });

    const commissionSums = await this.prisma.commission.groupBy({
      by: ['referredUserId'],
      where: { referrerUserId: userId },
      _sum: { amountCents: true },
    });
    const sumByUser = new Map(commissionSums.map((c) => [c.referredUserId, c._sum.amountCents ?? 0]));

    return referred.map((u) => ({
      // Privacy (Part 9 §4.2): partially mask the referred user's identity.
      maskedName: maskIdentity(u.name ?? u.email),
      signupDate: u.createdAt,
      status: u.plan === 'PAID' ? 'active' : 'cancelled',
      commissionEarnedCents: sumByUser.get(u.id) ?? 0,
      isRenewing: u.plan === 'PAID' && u.subscriptionStatus === 'active',
    }));
  }

  async listPayoutRequests(userId: string) {
    return this.prisma.payoutRequest.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async requestPayout(
    userId: string,
    method: PayoutMethod,
    details: { bankName?: string; accountNumber?: string; accountHolder?: string; paypalEmail?: string }
  ) {
    const balance = await this.getWithdrawableBalance(userId);
    if (balance <= 0) throw new BadRequestException('No withdrawable balance available.');

    let netAmountCents = balance;
    if (method === 'PAYPAL') {
      const settings = await this.platformSettings.get();
      const fee = Math.round((balance * settings.paypalFeePercent) / 100) + settings.paypalFeeFixedCents;
      netAmountCents = Math.max(0, balance - fee);
    }

    return this.prisma.payoutRequest.create({
      data: { userId, method, amountCents: balance, netAmountCents, details },
    });
  }

  // --- Admin (Part 9 §4.4) ------------------------------------------------

  async adminListAffiliates() {
    const links = await this.prisma.affiliateLink.findMany({
      include: { user: { select: { id: true, email: true, name: true } }, _count: { select: { clicks: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return Promise.all(
      links.map(async (link) => {
        const [referralCount, totalCommissions] = await Promise.all([
          this.prisma.user.count({ where: { referredByUserId: link.userId } }),
          this.totalEarnings(link.userId),
        ]);
        return {
          userId: link.userId,
          email: link.user.email,
          name: link.user.name,
          code: link.code,
          status: link.status,
          clicks: link._count.clicks,
          referrals: referralCount,
          totalCommissionsCents: totalCommissions,
        };
      })
    );
  }

  async adminGetAffiliateDetail(userId: string) {
    const link = await this.prisma.affiliateLink.findUnique({ where: { userId } });
    if (!link) throw new NotFoundException('This user has no referral link yet.');
    const stats = await this.getStats(userId);
    const referrals = await this.listReferrals(userId);
    const payouts = await this.listPayoutRequests(userId);
    return { status: link.status, ...stats, referrals, payouts };
  }

  async blockAffiliate(userId: string): Promise<void> {
    const link = await this.prisma.affiliateLink.findUnique({ where: { userId } });
    if (!link) throw new NotFoundException('This user has no referral link.');
    await this.prisma.affiliateLink.update({ where: { userId }, data: { status: 'BLOCKED' } });
  }

  // Deletes click/referral-attribution history only — Commission and
  // PayoutRequest rows are financial records and stay intact even here,
  // matching the "commissions already earned remain payable" principle
  // established for the (lesser-severity) block action above.
  async deleteAffiliateData(userId: string): Promise<void> {
    const link = await this.prisma.affiliateLink.findUnique({ where: { userId } });
    if (!link) throw new NotFoundException('This user has no referral link.');
    await this.prisma.user.updateMany({ where: { referredByUserId: userId }, data: { referredByUserId: null } });
    await this.prisma.affiliateLink.delete({ where: { userId } });
  }

  async adminListPayoutRequests() {
    return this.prisma.payoutRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true, name: true } } },
    });
  }

  async confirmPayout(payoutId: string, transactionReference: string) {
    const payout = await this.prisma.payoutRequest.findUnique({ where: { id: payoutId } });
    if (!payout) throw new NotFoundException('Payout request not found.');
    return this.prisma.payoutRequest.update({
      where: { id: payoutId },
      data: { status: 'COMPLETED', transactionReference, completedAt: new Date() },
    });
  }

  async markLatestPendingPayoutPaid(userId: string, transactionReference: string) {
    const latest = await this.prisma.payoutRequest.findFirst({
      where: { userId, status: 'UNDER_REVIEW' },
      orderBy: { createdAt: 'desc' },
    });
    if (!latest) throw new BadRequestException('This affiliate has no pending payout request.');
    return this.confirmPayout(latest.id, transactionReference);
  }

  async leaderboard() {
    const totals = await this.prisma.commission.groupBy({
      by: ['referrerUserId'],
      _sum: { amountCents: true },
      orderBy: { _sum: { amountCents: 'desc' } },
      take: 20,
    });
    const users = await this.prisma.user.findMany({
      where: { id: { in: totals.map((t) => t.referrerUserId) } },
      select: { id: true, email: true, name: true },
    });
    const userById = new Map(users.map((u) => [u.id, u]));

    return totals.map((t) => ({
      userId: t.referrerUserId,
      email: userById.get(t.referrerUserId)?.email ?? '',
      name: userById.get(t.referrerUserId)?.name ?? null,
      totalCommissionsCents: t._sum.amountCents ?? 0,
    }));
  }
}

function maskIdentity(value: string): string {
  if (value.includes('@')) {
    const [local, domain] = value.split('@');
    return `${local.slice(0, 2)}${'*'.repeat(Math.max(1, local.length - 2))}@${domain}`;
  }
  const parts = value.trim().split(' ');
  return parts.map((p) => `${p.slice(0, 1)}${'*'.repeat(Math.max(1, p.length - 1))}`).join(' ');
}
