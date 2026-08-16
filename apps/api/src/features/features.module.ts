import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FeatureService } from './feature.service';
import { FeatureGuard } from './feature.guard';
import { FeatureController } from './feature.controller';
import { CreditsModule } from '../credits/credits.module';

@Module({
  imports: [CreditsModule],
  controllers: [FeatureController],
  providers: [FeatureService, FeatureGuard, PrismaService],
  exports: [FeatureService, FeatureGuard],
})
export class FeaturesModule {}
