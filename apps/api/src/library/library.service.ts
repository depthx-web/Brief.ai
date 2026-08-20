import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { EmbeddingService } from '../embedding/embedding.service';

const SEARCH_RESULT_LIMIT = 10;
const SNIPPET_LENGTH = 240;

const DEFAULT_RETENTION_MS = 24 * 60 * 60 * 1000;
const EXTEND_RETENTION_DAYS = [7, 30] as const;

@Injectable()
export class LibraryService {
  private readonly logger = new Logger(LibraryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly embedding: EmbeddingService
  ) {}

  async addDocument(
    userId: string,
    file: Express.Multer.File,
    extractedText: string,
    docType?: string,
    projectId?: string,
    retentionDays?: number
  ) {
    if (projectId) await this.findOwnedProject(userId, projectId);

    const embeddingVector = await this.embedding.embed(extractedText);
    const storagePath = await this.storage.save(file.buffer, file.originalname);
    // Retention is per-file (Batch 5 fix): a document only carries an expiry
    // when it belongs to a project — Unsorted uploads never auto-delete.
    // When the caller doesn't pass an explicit retentionDays, fall back to
    // the user's configured default (Settings -> Privacy), which itself
    // falls back to the platform default of 24h if unset. 0 means "Never".
    let retentionHours: number | null;
    if (retentionDays !== undefined) {
      retentionHours = retentionDays * 24;
    } else {
      const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { defaultRetentionHours: true } });
      retentionHours = user?.defaultRetentionHours === 0 ? null : (user?.defaultRetentionHours ?? 24);
    }
    const expiresAt = projectId && retentionHours !== null ? new Date(Date.now() + retentionHours * 60 * 60 * 1000) : null;

    const doc = await this.prisma.libraryDocument.create({
      data: {
        userId,
        filename: file.originalname,
        storagePath,
        extractedText,
        embedding: embeddingVector,
        docType,
        projectId,
        expiresAt,
      },
    });

    return {
      id: doc.id,
      filename: doc.filename,
      docType: doc.docType,
      projectId: doc.projectId,
      expiresAt: doc.expiresAt,
      createdAt: doc.createdAt,
    };
  }

  async list(userId: string) {
    const docs = await this.prisma.libraryDocument.findMany({
      // Excludes files whose retention has already passed — an expired
      // file is still in the DB for up to 15 minutes until the retention
      // sweep runs, but it must never be browsable or pickable as a source
      // in that window (previously caused a 500 when picked from a tool's
      // "Choose from Library" step, since the file itself was often already
      // gone from disk while the row lingered).
      where: { userId, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
      select: { id: true, filename: true, docType: true, projectId: true, expiresAt: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return docs;
  }

  // --- Projects (Batch 3, Section 2; per-file retention fix in Batch 5) ----

  async createProject(userId: string, name: string, category: string | undefined) {
    return this.prisma.project.create({ data: { userId, name, category } });
  }

  async renameProject(userId: string, projectId: string, name: string) {
    await this.findOwnedProject(userId, projectId);
    return this.prisma.project.update({ where: { id: projectId }, data: { name } });
  }

  async listProjects(userId: string) {
    const projects = await this.prisma.project.findMany({
      where: { userId },
      include: {
        _count: { select: { documents: true } },
        documents: { select: { expiresAt: true }, orderBy: { expiresAt: 'asc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });
    return projects.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      createdAt: p.createdAt,
      // The file closest to expiry drives the card's countdown badge — a
      // project with no files yet (or none carrying an expiry) shows none.
      nearestExpiresAt: p.documents[0]?.expiresAt ?? null,
      documentCount: p._count.documents,
    }));
  }

  async getProject(userId: string, projectId: string) {
    const project = await this.findOwnedProject(userId, projectId);
    const documents = await this.prisma.libraryDocument.findMany({
      where: { projectId },
      select: { id: true, filename: true, docType: true, projectId: true, expiresAt: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return { ...project, documents };
  }

  // Bulk-extends every file currently in the project — the quick "Extend
  // retention" action from the project card's options menu.
  async extendProjectRetention(userId: string, projectId: string, days: number) {
    if (!EXTEND_RETENTION_DAYS.includes(days as (typeof EXTEND_RETENTION_DAYS)[number])) {
      throw new BadRequestException('Retention can only be extended to 7 or 30 days.');
    }
    await this.findOwnedProject(userId, projectId);
    const expiresAt = new Date(Date.now() + days * DEFAULT_RETENTION_MS);
    await this.prisma.libraryDocument.updateMany({ where: { projectId }, data: { expiresAt } });
    return { expiresAt };
  }

  async removeProject(userId: string, projectId: string) {
    await this.findOwnedProject(userId, projectId);
    const documents = await this.prisma.libraryDocument.findMany({
      where: { projectId },
      select: { storagePath: true },
    });
    await Promise.all(documents.map((d) => this.storage.delete(d.storagePath)));
    // LibraryDocument rows cascade-delete automatically (onDelete: Cascade in schema).
    await this.prisma.project.delete({ where: { id: projectId } });
  }

  private async findOwnedProject(userId: string, projectId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found.');
    if (project.userId !== userId) throw new ForbiddenException('You do not own this project.');
    return project;
  }

  async getFile(userId: string, documentId: string) {
    const doc = await this.findOwned(userId, documentId);
    if (doc.expiresAt && doc.expiresAt <= new Date()) {
      this.logger.warn(`getFile: document ${documentId} has expired (expiresAt=${doc.expiresAt.toISOString()}).`);
      throw new NotFoundException('This file has expired and is no longer available.');
    }
    try {
      const buffer = await this.storage.read(doc.storagePath);
      return { buffer, filename: doc.filename };
    } catch (err) {
      // The DB row can briefly outlive the physical file (e.g. the
      // retention sweep's file-delete succeeds but its own DB-delete
      // fails right after — see project-retention.service.ts) — surface
      // that as a clean 404 instead of an unhandled 500.
      this.logger.warn(`getFile: storage read failed for document ${documentId} (storagePath=${doc.storagePath}): ${err instanceof Error ? err.message : err}`);
      throw new NotFoundException('This file is no longer available.');
    }
  }

  async rename(userId: string, documentId: string, filename: string) {
    const doc = await this.findOwned(userId, documentId);
    const updated = await this.prisma.libraryDocument.update({
      where: { id: doc.id },
      data: { filename },
    });
    return {
      id: updated.id,
      filename: updated.filename,
      docType: updated.docType,
      projectId: updated.projectId,
      expiresAt: updated.expiresAt,
      createdAt: updated.createdAt,
    };
  }

  async remove(userId: string, documentId: string) {
    const doc = await this.findOwned(userId, documentId);
    await this.storage.delete(doc.storagePath);
    await this.prisma.libraryDocument.delete({ where: { id: doc.id } });
  }

  // Contextual menu "Duplicate" — a full independent copy (own storage
  // file, own retention clock), not a reference to the original.
  async duplicate(userId: string, documentId: string) {
    const doc = await this.findOwned(userId, documentId);
    const storagePath = await this.storage.copy(doc.storagePath);
    const copy = await this.prisma.libraryDocument.create({
      data: {
        userId,
        filename: `${doc.filename.replace(/(\.[a-zA-Z0-9]+)?$/, ' (copy)$1')}`,
        storagePath,
        extractedText: doc.extractedText,
        embedding: doc.embedding as unknown as number[],
        docType: doc.docType,
        projectId: doc.projectId,
        expiresAt: doc.expiresAt,
      },
    });
    return {
      id: copy.id,
      filename: copy.filename,
      docType: copy.docType,
      projectId: copy.projectId,
      expiresAt: copy.expiresAt,
      createdAt: copy.createdAt,
    };
  }

  // Contextual menu "Move to Project" — moving into a project starts a
  // retention clock if the file didn't have one (Unsorted never expires);
  // moving back to Unsorted clears it, matching the same per-file-only-
  // expires-inside-a-project rule addDocument() already follows.
  async move(userId: string, documentId: string, projectId: string | null) {
    const doc = await this.findOwned(userId, documentId);
    if (projectId) await this.findOwnedProject(userId, projectId);

    const expiresAt = projectId
      ? (doc.expiresAt ?? new Date(Date.now() + 24 * DEFAULT_RETENTION_MS))
      : null;

    const updated = await this.prisma.libraryDocument.update({
      where: { id: doc.id },
      data: { projectId, expiresAt },
    });
    return {
      id: updated.id,
      filename: updated.filename,
      docType: updated.docType,
      projectId: updated.projectId,
      expiresAt: updated.expiresAt,
      createdAt: updated.createdAt,
    };
  }

  // Contextual menu "Extend Retention" — single-document equivalent of
  // extendProjectRetention above, for a file the user wants to keep longer
  // without extending every other file in the same project.
  async extendDocumentRetention(userId: string, documentId: string, days: number) {
    if (!EXTEND_RETENTION_DAYS.includes(days as (typeof EXTEND_RETENTION_DAYS)[number])) {
      throw new BadRequestException('Retention can only be extended to 7 or 30 days.');
    }
    const doc = await this.findOwned(userId, documentId);
    const expiresAt = new Date(Date.now() + days * DEFAULT_RETENTION_MS);
    await this.prisma.libraryDocument.update({ where: { id: doc.id }, data: { expiresAt } });
    return { expiresAt };
  }

  async search(userId: string, query: string) {
    const queryEmbedding = await this.embedding.embed(query);
    const docs = await this.prisma.libraryDocument.findMany({
      where: { userId },
      select: { id: true, filename: true, extractedText: true, embedding: true, createdAt: true },
    });

    return docs
      .map((doc) => ({
        id: doc.id,
        filename: doc.filename,
        createdAt: doc.createdAt,
        snippet: doc.extractedText.slice(0, SNIPPET_LENGTH),
        score: EmbeddingService.cosineSimilarity(queryEmbedding, doc.embedding as number[]),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, SEARCH_RESULT_LIMIT);
  }

  private async findOwned(userId: string, documentId: string) {
    const doc = await this.prisma.libraryDocument.findUnique({ where: { id: documentId } });
    if (!doc) throw new NotFoundException('Document not found.');
    if (doc.userId !== userId) throw new ForbiddenException('You do not own this document.');
    return doc;
  }
}
