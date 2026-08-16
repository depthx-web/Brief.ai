import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import type { Plan, Segment, UserStatus } from '@prisma/client';

interface Failure {
  type: 'conversion' | 'password' | 'ai';
  id: string;
  detail: string;
  errorMessage: string | null;
  createdAt: Date;
}

export interface UserListFilters {
  search?: string;
  segment?: Segment;
  plan?: Plan;
  status?: UserStatus;
  page: number;
  pageSize: number;
}

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService
  ) {}

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

  async listUsers(filters: UserListFilters) {
    const where = {
      ...(filters.search
        ? {
            OR: [
              { email: { contains: filters.search } },
              { name: { contains: filters.search } },
            ],
          }
        : {}),
      ...(filters.segment ? { segment: filters.segment } : {}),
      ...(filters.plan ? { plan: filters.plan } : {}),
      ...(filters.status ? { status: filters.status } : {}),
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
        select: {
          id: true,
          email: true,
          name: true,
          segment: true,
          plan: true,
          billingCycle: true,
          status: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total, page: filters.page, pageSize: filters.pageSize };
  }

  async getUserDetail(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        segment: true,
        plan: true,
        billingCycle: true,
        status: true,
        subscriptionStatus: true,
        currentPeriodEnd: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found.');

    const recentUploads = await this.prisma.libraryDocument.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, filename: true, createdAt: true },
    });

    return { user, recentUploads };
  }

  async banUser(id: string): Promise<void> {
    await this.getExistingUser(id);
    await this.prisma.user.update({ where: { id }, data: { status: 'BANNED' } });
  }

  async reactivateUser(id: string): Promise<void> {
    await this.getExistingUser(id);
    await this.prisma.user.update({ where: { id }, data: { status: 'ACTIVE' } });
  }

  async resetUserPassword(id: string): Promise<void> {
    const user = await this.getExistingUser(id);
    const tempPassword = randomBytes(9).toString('base64url');
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    await this.prisma.user.update({ where: { id }, data: { passwordHash } });

    await this.mail.send({
      to: user.email,
      subject: 'Your Brief.ai password has been reset',
      html:
        `<p>An administrator reset your Brief.ai password.</p>` +
        `<p>Your temporary password is: <strong>${tempPassword}</strong></p>` +
        `<p>Please log in and change it as soon as possible.</p>`,
    });
  }

  private async getExistingUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found.');
    return user;
  }

  // --- Billing admin (Part 9 §2.1) ----------------------------------------

  async listPaymentTransactions(filters: { status?: string; type?: string; page: number; pageSize: number }) {
    const where: Record<string, unknown> = {};
    if (filters.status) where.status = filters.status;
    if (filters.type) where.type = filters.type;

    const [transactions, total] = await Promise.all([
      this.prisma.paymentTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
        include: { user: { select: { email: true, name: true } } },
      }),
      this.prisma.paymentTransaction.count({ where }),
    ]);

    return { transactions, total, page: filters.page, pageSize: filters.pageSize };
  }

  async listFailedPayments() {
    const users = await this.prisma.user.findMany({
      where: { dunningAttemptCount: { gt: 0 } },
      orderBy: { lastPaymentFailedAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        billingCycle: true,
        dunningAttemptCount: true,
        lastPaymentFailedAt: true,
        nextDunningRetryAt: true,
      },
    });
    return { users };
  }
}
