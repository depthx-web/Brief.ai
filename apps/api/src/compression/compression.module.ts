import { Module } from '@nestjs/common';
import { CompressionController } from './compression.controller';
import { CompressionService } from './compression.service';
import { PrismaService } from '../prisma/prisma.service';
import { FeaturesModule } from '../features/features.module';

@Module({
  imports: [FeaturesModule],
  controllers: [CompressionController],
  providers: [CompressionService, PrismaService],
})
export class CompressionModule {}
