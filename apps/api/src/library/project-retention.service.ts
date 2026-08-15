import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

// Enforces the retention promise made in the upload dialog (Batch 3,
// Section 2.1): a project and every file in it are deleted permanently once
// its clock runs out. Checked every 15 minutes rather than daily, since a
// 24h default window makes a once-a-day sweep too coarse.
@Injectable()
export class ProjectRetentionService {
  private readonly logger = new Logger(ProjectRetentionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService
  ) {}

  @Cron('*/15 * * * *')
  async deleteExpiredProjects(): Promise<void> {
    const expired = await this.prisma.project.findMany({
      where: { expiresAt: { lte: new Date() } },
      select: { id: true, documents: { select: { storagePath: true } } },
    });

    for (const project of expired) {
      try {
        await Promise.all(project.documents.map((d) => this.storage.delete(d.storagePath)));
        // LibraryDocument rows cascade-delete automatically (onDelete: Cascade in schema).
        await this.prisma.project.delete({ where: { id: project.id } });
      } catch (err) {
        this.logger.error(
          `Retention sweep failed for project ${project.id}: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }
  }
}
