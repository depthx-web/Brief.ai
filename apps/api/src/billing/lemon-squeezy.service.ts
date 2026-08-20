import { BadRequestException, Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import type { Segment } from '../auth/auth.service';
import type { BillingCycle } from './pricing';
import { DiscountCodeService } from './discount-code.service';
import { EmailCampaignService } from '../mail/email-campaign.service';
import { CreditsService } from '../credits/credits.service';
import { PlatformSettingsService } from '../platform-settings/platform-settings.service';
import { AffiliateService } from '../affiliate/affiliate.service';
import { CYCLE_LABELS } from './pricing';

const LEMON_SQUEEZY_API = 'https://api.lemonsqueezy.com/v1';

interface LemonSqueezyWebhookPayload {
  meta: {
    event_name: string;
    custom_data?: { userId?: string; cycle?: string; discountCode?: string; creditPackId?: string; creditAmount?: string };
  };
  data: {
    id: string;
    attributes: {
      status: string;
      customer_id: number;
      renews_at: string | null;
      ends_at: string | null;
      // Present on order_created / subscription_payment_* events. Cents,
      // matching how the rest of the platform stores money (priceCents etc).
      total?: number;
    };
  };
}

// Every segment/cycle combination needs its own Lemon Squeezy product variant,
// configured once in their dashboard. We only store the variant IDs here.
function variantEnvKey(segment: Segment, cycle: BillingCycle): string {
  return `LEMON_SQUEEZY_VARIANT_${segment}_${cycle}`;
}

@Injectable()
export class LemonSqueezyService {
  private readonly logger = new Logger(LemonSqueezyService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly discountCodes: DiscountCodeService,
    private readonly emailCampaigns: EmailCampaignService,
    private readonly credits: CreditsService,
    private readonly platformSettings: PlatformSettingsService,
    private readonly affiliates: AffiliateService
  ) {}

  private get apiKey(): string | undefined {
    return process.env.LEMON_SQUEEZY_API_KEY;
  }

  private get storeId(): string | undefined {
    return process.env.LEMON_SQUEEZY_STORE_ID;
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.storeId);
  }

  private async assertPaymentsEnabled(): Promise<void> {
    const settings = await this.platformSettings.get();
    if (!settings.paymentsEnabled) {
      throw new ServiceUnavailableException('Payments are temporarily disabled. Please try again later.');
    }
  }

  async createCheckoutUrl(
    userId: string,
    userEmail: string,
    segment: Segment,
    cycle: BillingCycle,
    discountCode?: string
  ): Promise<string> {
    await this.assertPaymentsEnabled();
    if (discountCode) {
      // Checked first and independent of Lemon Squeezy's own configuration —
      // no reason to require billing to be fully set up before telling the
      // user their code is invalid/expired/wrong-segment.
      await this.discountCodes.validateForCheckout(discountCode, segment);
    }

    if (!this.isConfigured()) {
      throw new ServiceUnavailableException(
        'Billing is not configured yet. Set LEMON_SQUEEZY_API_KEY and LEMON_SQUEEZY_STORE_ID to enable checkout.'
      );
    }
    const variantId = process.env[variantEnvKey(segment, cycle)];
    if (!variantId) {
      throw new ServiceUnavailableException(
        `No Lemon Squeezy variant configured for ${segment} / ${cycle} ` +
          `(expected env var ${variantEnvKey(segment, cycle)}).`
      );
    }

    const response = await fetch(`${LEMON_SQUEEZY_API}/checkouts`, {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            checkout_data: {
              email: userEmail,
              custom: { userId, cycle, discountCode },
              // Only applies monetarily if the same code also exists as a
              // discount in the Lemon Squeezy dashboard — our own
              // DiscountCode table controls eligibility/usage tracking on
              // our side, it doesn't create LS-side discounts automatically.
              ...(discountCode ? { discount_code: discountCode } : {}),
            },
          },
          relationships: {
            store: { data: { type: 'stores', id: this.storeId } },
            variant: { data: { type: 'variants', id: variantId } },
          },
        },
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`Lemon Squeezy checkout creation failed: ${response.status} ${body}`);
      throw new ServiceUnavailableException('Could not start checkout. Please try again shortly.');
    }

    const json = (await response.json()) as { data: { attributes: { url: string } } };
    return json.data.attributes.url;
  }

  // One-time purchase (a Lemon Squeezy "order", not a subscription) for a
  // credit pack — separate flow from createCheckoutUrl above since it's a
  // different LS product type and fires a different webhook event.
  async createCreditPackCheckoutUrl(
    userId: string,
    userEmail: string,
    packId: string,
    packSize: number,
    packVariantId: string
  ): Promise<string> {
    await this.assertPaymentsEnabled();
    if (!this.isConfigured()) {
      throw new ServiceUnavailableException(
        'Billing is not configured yet. Set LEMON_SQUEEZY_API_KEY and LEMON_SQUEEZY_STORE_ID to enable checkout.'
      );
    }

    const response = await fetch(`${LEMON_SQUEEZY_API}/checkouts`, {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            checkout_data: {
              email: userEmail,
              custom: { userId, creditPackId: packId, creditAmount: String(packSize) },
            },
          },
          relationships: {
            store: { data: { type: 'stores', id: this.storeId } },
            variant: { data: { type: 'variants', id: packVariantId } },
          },
        },
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`Lemon Squeezy credit-pack checkout creation failed: ${response.status} ${body}`);
      throw new ServiceUnavailableException('Could not start checkout. Please try again shortly.');
    }

    const json = (await response.json()) as { data: { attributes: { url: string } } };
    return json.data.attributes.url;
  }

  // Lemon Squeezy signs each webhook body with HMAC-SHA256 over the raw
  // (unparsed) request bytes — signature verification fails silently if you
  // verify against the re-serialized JSON instead.
  verifySignature(rawBody: Buffer, signatureHeader: string | undefined): boolean {
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
    if (!secret || !signatureHeader) return false;
    const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
    const expectedBuf = Buffer.from(expected, 'utf8');
    const actualBuf = Buffer.from(signatureHeader, 'utf8');
    if (expectedBuf.length !== actualBuf.length) return false;
    return timingSafeEqual(expectedBuf, actualBuf);
  }

  async handleWebhookEvent(payload: LemonSqueezyWebhookPayload): Promise<void> {
    const userId = payload.meta.custom_data?.userId;
    if (!userId) {
      this.logger.warn(`Lemon Squeezy webhook ${payload.meta.event_name} had no userId in custom_data.`);
      return;
    }
    const cycle = payload.meta.custom_data?.cycle as BillingCycle | undefined;
    const discountCode = payload.meta.custom_data?.discountCode;

    const { event_name } = payload.meta;
    const { status, customer_id, renews_at, ends_at } = payload.data.attributes;

    if (event_name === 'subscription_created' || event_name === 'subscription_updated') {
      const previousCycle =
        event_name === 'subscription_updated'
          ? (await this.prisma.user.findUnique({ where: { id: userId }, select: { billingCycle: true } }))?.billingCycle
          : null;
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: {
          plan: 'PAID',
          billingCycle: cycle,
          lemonSqueezyCustomerId: String(customer_id),
          subscriptionStatus: status,
          currentPeriodEnd: renews_at ? new Date(renews_at) : null,
          // A fresh paid subscription reactivates a previously-cancelled
          // account — clear the win-back clock so a future cancellation
          // starts it again instead of using a stale timestamp.
          subscriptionCancelledAt: null,
          winBackEmailSentAt: null,
        },
      });
      // Redeemed on actual subscription creation, not at checkout-start, so
      // an abandoned checkout doesn't burn a usage-limited code's count.
      if (event_name === 'subscription_created' && discountCode) {
        await this.discountCodes.redeem(discountCode);
      }
      if (event_name === 'subscription_created' && cycle) {
        await this.emailCampaigns.sendUpgradeConfirmation(user.email, user.name, CYCLE_LABELS[cycle]);
      }
      // Only a real cycle change (weekly<->monthly<->quarterly<->yearly on
      // an existing subscription), not the initial subscribe above, which
      // already gets its own upgrade-confirmation email.
      if (event_name === 'subscription_updated' && cycle && previousCycle && previousCycle !== cycle) {
        await this.emailCampaigns.sendPlanChanged(user.email, user.name, CYCLE_LABELS[cycle]);
      }
    } else if (event_name === 'order_created') {
      const creditAmount = Number(payload.meta.custom_data?.creditAmount ?? 0);
      if (creditAmount > 0) {
        await this.credits.grantPurchasedCredits(userId, creditAmount);
        await this.recordTransaction(userId, 'CREDIT_PURCHASE', 'SUCCEEDED', payload.data.attributes.total ?? 0, payload.data.id);
      } else {
        this.logger.warn(`order_created webhook for user ${userId} had no creditAmount in custom_data.`);
      }
    } else if (event_name === 'subscription_expired' || event_name === 'subscription_cancelled') {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: {
          plan: event_name === 'subscription_expired' ? 'FREE' : undefined,
          subscriptionStatus: status,
          currentPeriodEnd: ends_at ? new Date(ends_at) : null,
          subscriptionCancelledAt: new Date(),
        },
      });
      // Only the explicit cancellation, not a natural expiry — a
      // cancellation is a deliberate action worth confirming by email; an
      // expiry (e.g. a payment method that stopped working) already gets
      // the dunning flow's own communication.
      if (event_name === 'subscription_cancelled') {
        await this.emailCampaigns.sendCancellationConfirmation(user.email, user.name);
      }
    } else if (event_name === 'subscription_payment_success') {
      const amountCents = payload.data.attributes.total ?? 0;
      await this.recordTransaction(userId, 'SUBSCRIPTION_PAYMENT', 'SUCCEEDED', amountCents, payload.data.id);
      {
        const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
        if (user) await this.emailCampaigns.sendPaymentReceipt(user.email, user.name, `$${(amountCents / 100).toFixed(2)}`);
      }
      // Recovers the account from dunning — a successful payment (whether
      // on schedule or via Lemon Squeezy's own retry) clears the clock.
      await this.prisma.user.update({
        where: { id: userId },
        data: { dunningAttemptCount: 0, lastPaymentFailedAt: null, nextDunningRetryAt: null },
      });
      // Single source of truth for affiliate commissions (Part 9 §4.3): this
      // event fires on every successful subscription charge, first payment
      // included, so whether it's a SIGNUP or RENEWAL commission is decided
      // by whether a SIGNUP commission already exists for this user — avoids
      // double-counting against subscription_created, which doesn't reliably
      // carry a payment total.
      const alreadyHadSignup = await this.affiliates.hasEarnedSignupCommission(userId);
      await this.affiliates.awardCommission(userId, alreadyHadSignup ? 'RENEWAL' : 'SIGNUP', amountCents);
    } else if (event_name === 'subscription_payment_failed') {
      await this.recordTransaction(userId, 'SUBSCRIPTION_PAYMENT', 'FAILED', payload.data.attributes.total ?? 0, payload.data.id);
      const settings = await this.platformSettings.get();
      const nextRetryAt = new Date();
      nextRetryAt.setDate(nextRetryAt.getDate() + settings.dunningIntervalDays);
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          dunningAttemptCount: { increment: 1 },
          lastPaymentFailedAt: new Date(),
          nextDunningRetryAt: nextRetryAt,
        },
      });
    } else if (event_name === 'subscription_payment_refunded' || event_name === 'order_refunded') {
      await this.recordTransaction(userId, 'REFUND', 'REFUNDED', payload.data.attributes.total ?? 0, payload.data.id);
    } else {
      this.logger.log(`Unhandled Lemon Squeezy event: ${event_name}`);
    }
  }

  private async recordTransaction(
    userId: string,
    type: 'SUBSCRIPTION_PAYMENT' | 'CREDIT_PURCHASE' | 'REFUND',
    status: 'SUCCEEDED' | 'FAILED' | 'REFUNDED',
    amountCents: number,
    providerReferenceId: string
  ): Promise<void> {
    await this.prisma.paymentTransaction.create({
      data: { userId, type, status, amountCents, providerReferenceId },
    });
  }

  // Support-tool actions for the admin user drawer (Part 9 §2.2). These call
  // Lemon Squeezy directly where a real API exists for the action; "manual
  // extension" instead overrides currentPeriodEnd on our own side, since
  // that's the field our own entitlement checks actually read — Lemon
  // Squeezy doesn't expose an API to arbitrarily set a subscription's next
  // renewal date, so mirroring it there isn't possible.

  async cancelSubscription(userId: string, immediately: boolean): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found.');
    if (!user.lemonSqueezySubscriptionId) throw new BadRequestException('This user has no active subscription.');
    if (!this.isConfigured()) {
      throw new ServiceUnavailableException('Billing is not configured yet.');
    }

    const response = await fetch(`${LEMON_SQUEEZY_API}/subscriptions/${user.lemonSqueezySubscriptionId}`, {
      method: immediately ? 'DELETE' : 'PATCH',
      headers: {
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      ...(immediately
        ? {}
        : {
            body: JSON.stringify({
              data: {
                type: 'subscriptions',
                id: user.lemonSqueezySubscriptionId,
                attributes: { cancelled: true },
              },
            }),
          }),
    });
    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`Lemon Squeezy cancellation failed: ${response.status} ${body}`);
      throw new ServiceUnavailableException('Could not cancel this subscription. Please try again shortly.');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: immediately
        ? { plan: 'FREE', subscriptionStatus: 'cancelled', subscriptionCancelledAt: new Date() }
        : { subscriptionStatus: 'cancelled', subscriptionCancelledAt: new Date() },
    });
  }

  async extendSubscription(userId: string, newRenewalDate: Date): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found.');
    await this.prisma.user.update({ where: { id: userId }, data: { currentPeriodEnd: newRenewalDate } });
  }

  async refundLastPayment(userId: string): Promise<{ amountCents: number }> {
    const lastPayment = await this.prisma.paymentTransaction.findFirst({
      where: { userId, status: 'SUCCEEDED' },
      orderBy: { createdAt: 'desc' },
    });
    if (!lastPayment || !lastPayment.providerReferenceId) {
      throw new BadRequestException('No refundable payment found for this user.');
    }
    if (!this.isConfigured()) {
      throw new ServiceUnavailableException('Billing is not configured yet.');
    }

    const response = await fetch(`${LEMON_SQUEEZY_API}/orders/${lastPayment.providerReferenceId}/refund`, {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ data: { type: 'orders', id: lastPayment.providerReferenceId } }),
    });
    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`Lemon Squeezy refund failed: ${response.status} ${body}`);
      throw new ServiceUnavailableException('Could not process this refund. Please try again shortly.');
    }

    await this.recordTransaction(userId, 'REFUND', 'REFUNDED', lastPayment.amountCents, lastPayment.providerReferenceId);
    return { amountCents: lastPayment.amountCents };
  }

  // "Retry now" in the admin Failed Payments list. Lemon Squeezy runs its own
  // dunning retry schedule internally and doesn't expose an API to force an
  // off-cycle charge attempt — so this re-syncs the subscription's current
  // status from Lemon Squeezy (picking up a recovery that already happened
  // on their side) and logs the manual check-in either way.
  async retryFailedPayment(userId: string): Promise<{ recovered: boolean }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found.');
    if (!user.lemonSqueezySubscriptionId) throw new BadRequestException('This user has no active subscription.');
    if (!this.isConfigured()) {
      throw new ServiceUnavailableException('Billing is not configured yet.');
    }

    const response = await fetch(`${LEMON_SQUEEZY_API}/subscriptions/${user.lemonSqueezySubscriptionId}`, {
      headers: { Accept: 'application/vnd.api+json', Authorization: `Bearer ${this.apiKey}` },
    });
    if (!response.ok) {
      throw new ServiceUnavailableException('Could not reach Lemon Squeezy. Please try again shortly.');
    }
    const json = (await response.json()) as { data: { attributes: { status: string; renews_at: string | null } } };
    const recovered = json.data.attributes.status === 'active';

    await this.prisma.user.update({
      where: { id: userId },
      data: recovered
        ? {
            subscriptionStatus: json.data.attributes.status,
            currentPeriodEnd: json.data.attributes.renews_at ? new Date(json.data.attributes.renews_at) : null,
            dunningAttemptCount: 0,
            lastPaymentFailedAt: null,
            nextDunningRetryAt: null,
          }
        : { subscriptionStatus: json.data.attributes.status, nextDunningRetryAt: new Date() },
    });
    return { recovered };
  }

  // Card-on-file, billing address and invoice download are all owned by
  // Lemon Squeezy's own hosted checkout/portal, not stored locally — this
  // just hands back the per-subscription self-service portal URL rather
  // than duplicating PCI-sensitive data in our own database.
  async getCustomerPortalUrl(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found.');
    if (!user.lemonSqueezySubscriptionId) {
      throw new BadRequestException('Subscribe to a plan first — billing details appear here after your first payment.');
    }
    if (!this.isConfigured()) {
      throw new ServiceUnavailableException('Billing is not configured yet.');
    }

    const response = await fetch(`${LEMON_SQUEEZY_API}/subscriptions/${user.lemonSqueezySubscriptionId}`, {
      headers: { Accept: 'application/vnd.api+json', Authorization: `Bearer ${this.apiKey}` },
    });
    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`Lemon Squeezy portal lookup failed: ${response.status} ${body}`);
      throw new ServiceUnavailableException('Could not reach Lemon Squeezy. Please try again shortly.');
    }
    const json = (await response.json()) as { data: { attributes: { urls: { customer_portal: string } } } };
    return json.data.attributes.urls.customer_portal;
  }

  parseWebhookBody(rawBody: Buffer): LemonSqueezyWebhookPayload {
    try {
      return JSON.parse(rawBody.toString('utf8')) as LemonSqueezyWebhookPayload;
    } catch {
      throw new BadRequestException('Invalid webhook payload.');
    }
  }
}
