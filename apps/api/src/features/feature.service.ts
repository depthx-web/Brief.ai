import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Segment } from '@prisma/client';

@Injectable()
export class FeatureService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    return this.prisma.feature.findMany({ orderBy: [{ segment: 'asc' }, { order: 'asc' }] });
  }

  async update(id: string, data: { freeEnabled?: boolean; proEnabled?: boolean }) {
    return this.prisma.feature.update({ where: { id }, data });
  }

  // Used by FeatureGuard to decide whether a FREE-plan user can use a
  // specific tool, per the admin panel's live feature toggles. Matches
  // either a null-segment row (a tool available to every workspace — Office
  // <-> PDF, Protect, Remove Password) or a row scoped to the caller's own
  // segment (the per-profession AI operations); a given key is only ever
  // seeded as one or the other, never both, so `findFirst` resolves to the
  // single right row either way. Unknown/unseeded key combos default to
  // blocked — fail closed rather than silently letting new operations
  // through free.
  async isFreeEnabled(segment: Segment | null, key: string): Promise<boolean> {
    const feature = await this.prisma.feature.findFirst({
      where: { key, OR: [{ segment: null }, ...(segment ? [{ segment }] : [])] },
    });
    return feature?.freeEnabled ?? false;
  }

  // Human-readable name for a Feature.key, so a credit-spend transaction can
  // record which operation actually consumed it (Wallet's transaction list)
  // instead of a generic "AI operation" label.
  async findLabel(segment: Segment | null, key: string): Promise<string | null> {
    const feature = await this.prisma.feature.findFirst({
      where: { key, OR: [{ segment: null }, ...(segment ? [{ segment }] : [])] },
    });
    return feature?.label ?? null;
  }
}
