import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Segment } from '../auth/auth.service';
import type { BillingCycle } from './pricing';

// Display-only labels — the "Save 10%/20%" badges are a fixed marketing
// label, not computed from the current price, so admin-edited prices don't
// make the badge text lie or disappear.
const CYCLE_DISCOUNT_LABEL: Record<BillingCycle, number> = {
  WEEKLY: 0,
  MONTHLY: 0,
  QUARTERLY: 10,
  YEARLY: 20,
};

const SEGMENTS: Segment[] = ['LAWYER', 'ACCOUNTANT', 'RESEARCHER'];
const CYCLES: BillingCycle[] = ['WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'];

export interface PlanPriceRow {
  segment: Segment;
  cycle: BillingCycle;
  priceCents: number;
  discountPercent: number;
}

export interface SegmentPricing {
  segment: Segment;
  monthlyBaseCents: number;
  cycles: PlanPriceRow[];
}

@Injectable()
export class PricingService {
  constructor(private readonly prisma: PrismaService) {}

  async getMatrix(): Promise<SegmentPricing[]> {
    const rows = await this.prisma.planPrice.findMany();
    const bySegmentCycle = new Map(rows.map((r) => [`${r.segment}:${r.cycle}`, r.priceCents]));

    return SEGMENTS.map((segment) => ({
      segment,
      monthlyBaseCents: bySegmentCycle.get(`${segment}:MONTHLY`) ?? 0,
      cycles: CYCLES.map((cycle) => ({
        segment,
        cycle,
        priceCents: bySegmentCycle.get(`${segment}:${cycle}`) ?? 0,
        discountPercent: CYCLE_DISCOUNT_LABEL[cycle],
      })),
    }));
  }

  async listAll(): Promise<PlanPriceRow[]> {
    const rows = await this.prisma.planPrice.findMany({ orderBy: [{ segment: 'asc' }, { cycle: 'asc' }] });
    return rows.map((r) => ({
      segment: r.segment,
      cycle: r.cycle,
      priceCents: r.priceCents,
      discountPercent: CYCLE_DISCOUNT_LABEL[r.cycle],
    }));
  }

  async updatePrice(segment: Segment, cycle: BillingCycle, priceCents: number): Promise<void> {
    await this.prisma.planPrice.upsert({
      where: { segment_cycle: { segment, cycle } },
      update: { priceCents },
      create: { segment, cycle, priceCents },
    });
  }
}
