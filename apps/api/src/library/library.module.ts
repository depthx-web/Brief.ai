import { Module } from '@nestjs/common';
import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';
import { ProjectRetentionService } from './project-retention.service';
import { RetentionWarningService } from './retention-warning.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { EmbeddingService } from '../embedding/embedding.service';
import { AuthModule } from '../auth/auth.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [AuthModule, MailModule],
  controllers: [LibraryController],
  providers: [LibraryService, ProjectRetentionService, RetentionWarningService, PrismaService, StorageService, EmbeddingService],
})
export class LibraryModule {}
