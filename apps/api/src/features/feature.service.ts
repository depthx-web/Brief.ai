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
}
