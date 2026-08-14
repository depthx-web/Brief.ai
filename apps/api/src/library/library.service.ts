import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { EmbeddingService } from '../embedding/embedding.service';

const SEARCH_RESULT_LIMIT = 10;
const SNIPPET_LENGTH = 240;

@Injectable()
export class LibraryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly embedding: EmbeddingService
  ) {}

  async addDocument(userId: string, file: Express.Multer.File, extractedText: string, docType?: string) {
    const embeddingVector = await this.embedding.embed(extractedText);
    const storagePath = await this.storage.save(file.buffer, file.originalname);

    const doc = await this.prisma.libraryDocument.create({
      data: {
        userId,
        filename: file.originalname,
        storagePath,
        extractedText,
        embedding: embeddingVector,
        docType,
      },
    });

    return { id: doc.id, filename: doc.filename, docType: doc.docType, createdAt: doc.createdAt };
  }

  async list(userId: string) {
    const docs = await this.prisma.libraryDocument.findMany({
      where: { userId },
      select: { id: true, filename: true, docType: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return docs;
  }

  async getFile(userId: string, documentId: string) {
    const doc = await this.findOwned(userId, documentId);
    const buffer = await this.storage.read(doc.storagePath);
    return { buffer, filename: doc.filename };
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
