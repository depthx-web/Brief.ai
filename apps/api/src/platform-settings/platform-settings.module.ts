import { Module } from '@nestjs/common';
import { PlatformSettingsService } from './platform-settings.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [PlatformSettingsService, PrismaService],
  exports: [PlatformSettingsService],
})
export class PlatformSettingsModule {}
