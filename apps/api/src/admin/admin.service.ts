import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface Failure {
  type: 'conversion' | 'password' | 'ai';
  id: string;
  detail: string;
  errorMessage: string | null;
  createdAt: Date;
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [
      totalUsers,
      usersBySegment,
      totalLibraryDocuments,
      conversionByStatus,
      conversionByFormat,
      passwordByOperation,
      aiByOperation,
      recentFailures,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.groupBy({ by: ['segment'], _count: true }),
      this.prisma.libraryDocument.count(),
      this.prisma.conversionJob.groupBy({ by: ['status'], _count: true }),
      this.prisma.conversionJob.groupBy({ by: ['targetFormat'], _count: true }),
      this.prisma.passwordJob.groupBy({ by: ['operation', 'status'], _count: true }),
      this.prisma.aiJob.groupBy({ by: ['operation', 'status'], _count: true }),
      this.getRecentFailures(),
    ]);

    return {
      users: { total: totalUsers, bySegment: usersBySegment },
      libraryDocuments: { total: totalLibraryDocuments },
      conversions: { byStatus: conversionByStatus, byFormat: conversionByFormat },
      passwordOperations: passwordByOperation,
      aiOperations: aiByOperation,
      recentFailures,
    };
  }

  private async getRecentFailures(): Promise<Failure[]> {
    const [conversions, passwords, ai] = await Promise.all([
      this.prisma.conversionJob.findMany({
        where: { status: 'FAILED' },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, sourceFormat: true, targetFormat: true, errorMessage: true, createdAt: true },
      }),
      this.prisma.passwordJob.findMany({
        where: { status: 'FAILED' },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, operation: true, errorMessage: true, createdAt: true },
      }),
      this.prisma.aiJob.findMany({
        where: { status: 'FAILED' },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, operation: true, errorMessage: true, createdAt: true },
      }),
    ]);

    const failures: Failure[] = [
      ...conversions.map((c) => ({
        type: 'conversion' as const,
        id: c.id,
        detail: `${c.sourceFormat} → ${c.targetFormat}`,
        errorMessage: c.errorMessage,
        createdAt: c.createdAt,
      })),
      ...passwords.map((p) => ({
        type: 'password' as const,
        id: p.id,
        detail: p.operation,
        errorMessage: p.errorMessage,
        createdAt: p.createdAt,
      })),
      ...ai.map((a) => ({
        type: 'ai' as const,
        id: a.id,
        detail: a.operation,
        errorMessage: a.errorMessage,
        createdAt: a.createdAt,
      })),
    ];

    return failures.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 20);
  }
}
