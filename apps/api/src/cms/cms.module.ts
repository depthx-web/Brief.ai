import { Module } from '@nestjs/common';
import { CmsController } from './cms.controller';
import { CmsAdminController } from './cms-admin.controller';
import { CmsService } from './cms.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [CmsController, CmsAdminController],
  providers: [CmsService, PrismaService],
})
export class CmsModule {}
