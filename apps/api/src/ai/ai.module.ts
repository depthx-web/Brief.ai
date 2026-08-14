import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { LiteLlmService } from './litellm.service';
import { LiteLlmAdminService } from './litellm-admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { FeaturesModule } from '../features/features.module';

@Module({
  imports: [FeaturesModule],
  controllers: [AiController],
  providers: [AiService, LiteLlmService, LiteLlmAdminService, PrismaService],
  exports: [LiteLlmAdminService],
})
export class AiModule {}
