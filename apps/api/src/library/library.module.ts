import { Module } from '@nestjs/common';
import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { EmbeddingService } from '../embedding/embedding.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [LibraryController],
  providers: [LibraryService, PrismaService, StorageService, EmbeddingService],
})
export class LibraryModule {}
