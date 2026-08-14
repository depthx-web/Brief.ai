import { BadRequestException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import type { Segment } from '../auth/auth.service';
import type { BillingCycle } from './pricing';
import { DiscountCodeService } from './discount-code.service';
import { EmailCampaignService } from '../mail/email-campaign.service';
import { CYCLE_LABELS } from './pricing';

const LEMON_SQUEEZY_API = 'https://api.lemonsqueezy.com/v1';

interface LemonSqueezyWebhookPayload {
  meta: {
    event_name: string;
    custom_data?: { userId?: string; cycle?: string; discountCode?: string };
  };
  data: {
    attributes: {
      status: string;
      customer_id: number;
      renews_at: string | null;
      ends_at: string | null;
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
    private readonly emailCampaigns: EmailCampaignService
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

  async createCheckoutUrl(
    userId: string,
    userEmail: string,
    segment: Segment,
    cycle: BillingCycle,
    discountCode?: string
  ): Promise<string> {
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
    } else if (event_name === 'subscription_expired' || event_name === 'subscription_cancelled') {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          plan: event_name === 'subscription_expired' ? 'FREE' : undefined,
          subscriptionStatus: status,
          currentPeriodEnd: ends_at ? new Date(ends_at) : null,
          subscriptionCancelledAt: new Date(),
        },
      });
    } else {
      this.logger.log(`Unhandled Lemon Squeezy event: ${event_name}`);
    }
  }

  parseWebhookBody(rawBody: Buffer): LemonSqueezyWebhookPayload {
    try {
      return JSON.parse(rawBody.toString('utf8')) as LemonSqueezyWebhookPayload;
    } catch {
      throw new BadRequestException('Invalid webhook payload.');
    }
  }
}
