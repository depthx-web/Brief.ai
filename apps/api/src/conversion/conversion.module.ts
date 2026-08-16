import { Module } from '@nestjs/common';
import { ConversionController } from './conversion.controller';
import { ConversionService } from './conversion.service';
import { PrismaService } from '../prisma/prisma.service';
import { FeaturesModule } from '../features/features.module';

@Module({
  imports: [FeaturesModule],
  controllers: [ConversionController],
  providers: [ConversionService, PrismaService],
})
export class ConversionModule {}
