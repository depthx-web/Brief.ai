import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { EmbeddingService } from '../embedding/embedding.service';

const SEARCH_RESULT_LIMIT = 10;
const SNIPPET_LENGTH = 240;

const DEFAULT_RETENTION_MS = 24 * 60 * 60 * 1000;
const EXTEND_RETENTION_DAYS = [7, 30] as const;

@Injectable()
export class LibraryService {
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
    retentionDays = 1
  ) {
    if (projectId) await this.findOwnedProject(userId, projectId);

    const embeddingVector = await this.embedding.embed(extractedText);
    const storagePath = await this.storage.save(file.buffer, file.originalname);
    // Retention is per-file (Batch 5 fix): a document only carries an expiry
    // when it belongs to a project — Unsorted uploads never auto-delete.
    const expiresAt = projectId ? new Date(Date.now() + retentionDays * DEFAULT_RETENTION_MS) : null;

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
      where: { userId },
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
    const buffer = await this.storage.read(doc.storagePath);
    return { buffer, filename: doc.filename };
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
