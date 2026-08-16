import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PrismaService } from '../prisma/prisma.service';

export const COMPRESSION_PRESETS = ['ebook', 'screen'] as const;
export type CompressionPreset = (typeof COMPRESSION_PRESETS)[number];

const PRESET_LABEL: Record<CompressionPreset, string> = {
  ebook: 'balanced (150 dpi images)',
  screen: 'smallest (72 dpi images)',
};

const COMPRESSION_TIMEOUT_MS = Number(process.env.COMPRESSION_TIMEOUT_MS ?? 60_000);

// Unlike the free client-side Compress tool (which rasterizes every page to
// a JPEG, destroying text selectability), this recompresses only the
// embedded raster images inside the PDF via Ghostscript's pdfwrite device —
// vector text and its selectability/searchability are untouched. That
// server-side image-recompression pass is what genuinely earns the PRO tier
// here, not a marketing claim of "AI" — Ghostscript's -dPDFSETTINGS presets
// are the standard, real way to do this well.
@Injectable()
export class CompressionService {
  private readonly logger = new Logger(CompressionService.name);

  constructor(private readonly prisma: PrismaService) {}

  async compress(file: Express.Multer.File, preset: CompressionPreset): Promise<Buffer> {
    const startedAt = Date.now();
    const job = await this.prisma.conversionJob.create({
      data: {
        originalFilename: file.originalname,
        sourceFormat: 'pdf',
        targetFormat: `pdf-compressed-${preset}`,
        status: 'PROCESSING',
      },
    });

    const workDir = await mkdtemp(join(tmpdir(), 'brief-ai-compress-'));
    const inputPath = join(workDir, 'input.pdf');
    const outputPath = join(workDir, 'output.pdf');

    try {
      await writeFile(inputPath, file.buffer);
      await this.runGhostscript(inputPath, outputPath, preset);
      const outputBuffer = await readFile(outputPath);

      await this.prisma.conversionJob.update({
        where: { id: job.id },
        data: { status: 'SUCCESS', durationMs: Date.now() - startedAt },
      });

      return outputBuffer;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown compression error';
      this.logger.error(`Compression ${job.id} failed: ${message}`);
      await this.prisma.conversionJob.update({
        where: { id: job.id },
        data: { status: 'FAILED', errorMessage: message.slice(0, 2000), durationMs: Date.now() - startedAt },
      });
      throw err;
    } finally {
      await rm(workDir, { recursive: true, force: true });
    }
  }

  private runGhostscript(inputPath: string, outputPath: string, preset: CompressionPreset): Promise<void> {
    return new Promise((resolve, reject) => {
      const args = [
        '-sDEVICE=pdfwrite',
        '-dCompatibilityLevel=1.4',
        `-dPDFSETTINGS=/${preset}`,
        '-dNOPAUSE',
        '-dQUIET',
        '-dBATCH',
        '-dSAFER',
        `-sOutputFile=${outputPath}`,
        inputPath,
      ];
      const proc = spawn(process.env.GS_BIN ?? 'gs', args);

      const timer = setTimeout(() => {
        proc.kill('SIGKILL');
        reject(new Error('Compression timed out.'));
      }, COMPRESSION_TIMEOUT_MS);

      let stderr = '';
      proc.stderr?.on('data', (chunk: Buffer) => {
        stderr += chunk.toString();
      });

      proc.on('error', (err) => {
        clearTimeout(timer);
        reject(err);
      });

      proc.on('close', (code) => {
        clearTimeout(timer);
        if (code === 0) resolve();
        else reject(new Error(`ghostscript exited with code ${code}: ${stderr.trim()}`));
      });
    });
  }
}

export { PRESET_LABEL };
