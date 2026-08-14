import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { DiscountCode, DiscountType } from '@prisma/client';
import type { Segment } from '../auth/auth.service';

export type DiscountStatus = 'active' | 'expired' | 'revoked';

export interface DiscountCodeView extends DiscountCode {
  status: DiscountStatus;
}

interface CreateDiscountCodeInput {
  code: string;
  type: DiscountType;
  value: number;
  expiresAt?: Date;
  usageLimit?: number;
  applicableSegments: Segment[];
}

function computeStatus(code: DiscountCode): DiscountStatus {
  if (code.revoked) return 'revoked';
  if (code.expiresAt && code.expiresAt.getTime() < Date.now()) return 'expired';
  if (code.usageLimit !== null && code.usageCount >= code.usageLimit) return 'expired';
  return 'active';
}

@Injectable()
export class DiscountCodeService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<DiscountCodeView[]> {
    const codes = await this.prisma.discountCode.findMany({ orderBy: { createdAt: 'desc' } });
    return codes.map((c) => ({ ...c, status: computeStatus(c) }));
  }

  async create(input: CreateDiscountCodeInput): Promise<DiscountCodeView> {
    const code = input.code.trim().toUpperCase();
    if (!code) throw new BadRequestException('Code is required.');
    if (input.value <= 0) throw new BadRequestException('Discount value must be positive.');
    if (input.type === 'PERCENT' && input.value > 100) {
      throw new BadRequestException('Percentage discount cannot exceed 100.');
    }

    const existing = await this.prisma.discountCode.findUnique({ where: { code } });
    if (existing) throw new BadRequestException('A code with this name already exists.');

    const created = await this.prisma.discountCode.create({
      data: {
        code,
        type: input.type,
        value: input.value,
        expiresAt: input.expiresAt,
        usageLimit: input.usageLimit,
        applicableSegments: input.applicableSegments,
      },
    });
    return { ...created, status: computeStatus(created) };
  }

  async revoke(id: string): Promise<void> {
    const existing = await this.prisma.discountCode.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Discount code not found.');
    await this.prisma.discountCode.update({ where: { id }, data: { revoked: true } });
  }

  // Throws if the code can't be used for this checkout — called before
  // handing off to Lemon Squeezy so the user gets a clear reason inline
  // rather than a confusing failure mid-checkout.
  async validateForCheckout(code: string, segment: Segment): Promise<DiscountCode> {
    const record = await this.prisma.discountCode.findUnique({ where: { code: code.trim().toUpperCase() } });
    if (!record) throw new BadRequestException('This code is not valid.');
    const status = computeStatus(record);
    if (status !== 'active') throw new BadRequestException('This code is no longer valid.');
    const segments = record.applicableSegments as Segment[];
    if (!segments.includes(segment)) {
      throw new BadRequestException('This code does not apply to your workspace.');
    }
    return record;
  }

  // Called from the Lemon Squeezy webhook once a subscription actually
  // completes — not at checkout-start — so abandoned checkouts don't burn
  // through a usage-limited code.
  async redeem(code: string): Promise<void> {
    await this.prisma.discountCode.updateMany({
      where: { code: code.trim().toUpperCase() },
      data: { usageCount: { increment: 1 } },
    });
  }
}
