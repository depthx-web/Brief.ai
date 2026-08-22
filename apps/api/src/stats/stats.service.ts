import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// Below this sample size a percentage/average reads as statistically thin
// (e.g. "100%" from 3 files) rather than a real aggregate — the homepage
// falls back to honest qualitative wording for that metric instead. See
// the homepage trust-stats spec this ships against.
const MIN_SAMPLE = 50;
const CACHE_ID = 1;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
// Comfortably longer than the retention cron's own 15-minute cadence
// (project-retention.service.ts), so a document mid-cycle isn't counted as
// a compliance failure just for being a few minutes past expiresAt.
const DELETION_GRACE_MS = 20 * 60 * 1000;

export interface HomepageStatMetric {
  // Percentage (0-100) for the two rate metrics, whole seconds for the
  // processing-time metric. Null whenever isFallback is true.
  value: number | null;
  isFallback: boolean;
  // No English copy here on purpose — the site is 6-locale, so the
  // frontend picks its own translated fallback string per metric/variant
  // out of the dictionary rather than rendering API-supplied text.
  fallbackVariant?: 'allCompliant' | 'default';
}

export interface HomepageStatsPayload {
  autoDeletionCompliance: HomepageStatMetric;
  avgProcessingSeconds: HomepageStatMetric;
  clientSideShare: HomepageStatMetric;
  computedAt: string;
}

const ALL_TIME = new Date(0);
const SETTINGS_ID = 'singleton';

// Illustrative figures shown while homepageStatsDemoMode is on (admin
// toggle, PlatformSettings) — the same example numbers the original spec
// for this section used. Never served silently forever: the admin panel's
// Analytics tab always shows the real computed numbers alongside the
// toggle, so there's a clear signal for when to switch it off.
function demoPayload(): HomepageStatsPayload {
  return {
    autoDeletionCompliance: { value: 100, isFallback: false },
    avgProcessingSeconds: { value: 8, isFallback: false },
    clientSideShare: { value: 62, isFallback: false },
    computedAt: new Date().toISOString(),
  };
}

@Injectable()
export class StatsService implements OnModuleInit {
  private readonly logger = new Logger(StatsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.recompute();
    } catch (err) {
      this.logger.error(
        `Initial homepage stats computation failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  // Recomputed periodically rather than on every page load — the homepage
  // just reads whatever this last wrote to HomepageStatsCache.
  @Cron('*/30 * * * *')
  async recompute(): Promise<void> {
    const data = await this.computeAll();
    await this.prisma.homepageStatsCache.upsert({
      where: { id: CACHE_ID },
      create: { id: CACHE_ID, data: data as unknown as Prisma.InputJsonValue, updatedAt: new Date() },
      update: { data: data as unknown as Prisma.InputJsonValue, updatedAt: new Date() },
    });
  }

  // bypassDemoMode: true always returns the real computed/cached numbers —
  // used by the admin preview endpoint so an admin can see genuine volume
  // without first having to switch demo mode off for everyone.
  async getCached(bypassDemoMode = false): Promise<HomepageStatsPayload> {
    if (!bypassDemoMode) {
      const settings = await this.prisma.platformSettings.findUnique({ where: { id: SETTINGS_ID } });
      if (settings?.homepageStatsDemoMode ?? true) return demoPayload();
    }
    const row = await this.prisma.homepageStatsCache.findUnique({ where: { id: CACHE_ID } });
    if (row) return row.data as unknown as HomepageStatsPayload;
    // Cold start: nothing written yet (first request racing onModuleInit).
    return this.computeAll();
  }

  async recordClientOperation(tool?: string): Promise<void> {
    await this.prisma.clientOperationEvent.create({ data: { tool: tool?.slice(0, 191) } });
  }

  private async computeAll(): Promise<HomepageStatsPayload> {
    const [autoDeletionCompliance, avgProcessingSeconds, clientSideShare] = await Promise.all([
      this.computeAutoDeletionCompliance(),
      this.computeAvgProcessingSeconds(),
      this.computeClientSideShare(),
    ]);
    return { autoDeletionCompliance, avgProcessingSeconds, clientSideShare, computedAt: new Date().toISOString() };
  }

  // Of every document that has ever been due for retention deletion, what
  // fraction did the cron actually sweep vs. leave sitting past expiry?
  // All-time window — this is a policy-compliance metric, not a trend.
  private async computeAutoDeletionCompliance(): Promise<HomepageStatMetric> {
    const [autoDeletedCount, stillOverdue] = await Promise.all([
      this.prisma.aiJob.count({ where: { operation: 'DOCUMENT_AUTO_DELETED' } }),
      this.prisma.libraryDocument.count({ where: { expiresAt: { lte: new Date(Date.now() - DELETION_GRACE_MS) } } }),
    ]);
    const denominator = autoDeletedCount + stillOverdue;
    if (denominator < MIN_SAMPLE) {
      return { value: null, isFallback: true, fallbackVariant: stillOverdue === 0 ? 'allCompliant' : 'default' };
    }
    return { value: (autoDeletedCount / denominator) * 100, isFallback: false };
  }

  private async weightedDuration(since: Date): Promise<{ totalMs: number; totalCount: number }> {
    const baseWhere = { status: 'SUCCESS' as const, durationMs: { not: null }, createdAt: { gte: since } };
    const [conv, pass, ai] = await Promise.all([
      this.prisma.conversionJob.aggregate({ _sum: { durationMs: true }, _count: { _all: true }, where: baseWhere }),
      this.prisma.passwordJob.aggregate({ _sum: { durationMs: true }, _count: { _all: true }, where: baseWhere }),
      this.prisma.aiJob.aggregate({ _sum: { durationMs: true }, _count: { _all: true }, where: baseWhere }),
    ]);
    const totalMs = (conv._sum.durationMs ?? 0) + (pass._sum.durationMs ?? 0) + (ai._sum.durationMs ?? 0);
    const totalCount = conv._count._all + pass._count._all + ai._count._all;
    return { totalMs, totalCount };
  }

  // Average of (completion − start) across every completed conversion,
  // password, and AI operation. 30-day window widened to all-time first if
  // the sample is thin, per the spec's ordering (widen before falling back
  // to qualitative wording).
  private async computeAvgProcessingSeconds(): Promise<HomepageStatMetric> {
    let { totalMs, totalCount } = await this.weightedDuration(new Date(Date.now() - THIRTY_DAYS_MS));
    if (totalCount < MIN_SAMPLE) {
      const wide = await this.weightedDuration(ALL_TIME);
      if (wide.totalCount > totalCount) ({ totalMs, totalCount } = wide);
    }
    if (totalCount < MIN_SAMPLE) {
      return { value: null, isFallback: true, fallbackVariant: 'default' };
    }
    return { value: Math.ceil(totalMs / totalCount / 1000), isFallback: false };
  }

  private async countServerOps(since: Date): Promise<number> {
    const [conv, pass, ai] = await Promise.all([
      this.prisma.conversionJob.count({ where: { createdAt: { gte: since } } }),
      this.prisma.passwordJob.count({ where: { createdAt: { gte: since } } }),
      this.prisma.aiJob.count({
        where: { createdAt: { gte: since }, operation: { notIn: ['DOCUMENT_DELETED', 'DOCUMENT_AUTO_DELETED'] } },
      }),
    ]);
    return conv + pass + ai;
  }

  // Ratio of operations that never touched the API (client-side tools —
  // see ClientOperationEvent) to all operations, client + server. Same
  // widen-then-fallback ordering as the processing-time metric.
  private async computeClientSideShare(): Promise<HomepageStatMetric> {
    const since30 = new Date(Date.now() - THIRTY_DAYS_MS);
    let [clientCount, serverCount] = await Promise.all([
      this.prisma.clientOperationEvent.count({ where: { createdAt: { gte: since30 } } }),
      this.countServerOps(since30),
    ]);
    let total = clientCount + serverCount;
    if (total < MIN_SAMPLE) {
      const [wideClient, wideServer] = await Promise.all([
        this.prisma.clientOperationEvent.count({ where: { createdAt: { gte: ALL_TIME } } }),
        this.countServerOps(ALL_TIME),
      ]);
      const wideTotal = wideClient + wideServer;
      if (wideTotal > total) {
        clientCount = wideClient;
        serverCount = wideServer;
        total = wideTotal;
      }
    }
    if (total < MIN_SAMPLE) {
      return { value: null, isFallback: true, fallbackVariant: 'default' };
    }
    return { value: Math.round((clientCount / total) * 100), isFallback: false };
  }
}
