import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

// Enforces the retention promise made in the upload dialog (Batch 3,
// Section 2.1; per-file fix in Batch 5, Part 8): each file in a project
// carries its own clock — default 1h, extendable to 7 or 30 days — so one
// old file expiring doesn't take the rest of a long-running project with
// it. Checked every 15 minutes rather than daily, since a 1h default
// window makes a once-a-day sweep far too coarse.
@Injectable()
export class ProjectRetentionService {
  private readonly logger = new Logger(ProjectRetentionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService
  ) {}

  @Cron('*/15 * * * *')
  async deleteExpiredDocuments(): Promise<void> {
    const expired = await this.prisma.libraryDocument.findMany({
      where: { expiresAt: { lte: new Date() } },
      select: { id: true, storagePath: true, projectId: true, userId: true },
    });

    const touchedProjectIds = new Set<string>();
    for (const doc of expired) {
      try {
        await this.storage.delete(doc.storagePath);
        await this.prisma.libraryDocument.delete({ where: { id: doc.id } });
        if (doc.projectId) touchedProjectIds.add(doc.projectId);
        // Surfaced in Settings > Activity — the manual-delete counterpart
        // of this log entry lives in library.service.ts's remove().
        await this.prisma.aiJob.create({
          data: { operation: 'DOCUMENT_AUTO_DELETED', userId: doc.userId, status: 'SUCCESS' },
        });
      } catch (err) {
        this.logger.error(
          `Retention sweep failed for document ${doc.id}: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }

    // A project left with zero files after its last one expired is just
    // clutter on the Library page — clean it up rather than leaving an
    // empty card around.
    for (const projectId of touchedProjectIds) {
      const remaining = await this.prisma.libraryDocument.count({ where: { projectId } });
      if (remaining === 0) {
        await this.prisma.project.delete({ where: { id: projectId } }).catch(() => {});
      }
    }
  }
}
