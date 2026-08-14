import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FeatureService } from './feature.service';
import { FeatureGuard } from './feature.guard';

@Module({
  providers: [FeatureService, FeatureGuard, PrismaService],
  exports: [FeatureService, FeatureGuard],
})
export class FeaturesModule {}
