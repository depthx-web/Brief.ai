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

  // Used by FeatureGuard to decide whether a FREE-plan user in this segment
  // can use a specific AI operation, per the admin panel's live feature
  // toggles. Unknown segment/key combos (no seeded row) default to blocked —
  // fail closed rather than silently letting new operations through free.
  async isFreeEnabled(segment: Segment, key: string): Promise<boolean> {
    const feature = await this.prisma.feature.findUnique({ where: { segment_key: { segment, key } } });
    return feature?.freeEnabled ?? false;
  }
}
