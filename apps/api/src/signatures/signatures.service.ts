import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Data URLs only (no file storage) — see schema.prisma for why. Capped well
// above what a hand-drawn or lightly-compressed uploaded signature needs,
// to keep someone from parking an arbitrary large image in the column.
const MAX_IMAGE_DATA_LENGTH = 500_000;

@Injectable()
export class SignaturesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    return this.prisma.savedSignature.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, name: string, imageData: string) {
    if (!imageData.startsWith('data:image/')) throw new BadRequestException('Signature must be an image.');
    if (imageData.length > MAX_IMAGE_DATA_LENGTH) throw new BadRequestException('Signature image is too large.');
    return this.prisma.savedSignature.create({ data: { userId, name, imageData } });
  }

  async remove(userId: string, id: string) {
    const signature = await this.prisma.savedSignature.findUnique({ where: { id } });
    if (!signature) throw new NotFoundException('Signature not found.');
    if (signature.userId !== userId) throw new ForbiddenException('You do not own this signature.');
    await this.prisma.savedSignature.delete({ where: { id } });
  }
}
