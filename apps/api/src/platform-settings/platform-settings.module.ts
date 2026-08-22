import { Module } from '@nestjs/common';
import { PlatformSettingsController } from './platform-settings.controller';
import { PlatformSettingsService } from './platform-settings.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PlatformSettingsController],
  providers: [PlatformSettingsService, PrismaService],
  exports: [PlatformSettingsService],
})
export class PlatformSettingsModule {}
