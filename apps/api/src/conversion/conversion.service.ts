import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'node:child_process';
import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';

export const ALLOWED_TARGET_FORMATS = ['pdf', 'docx', 'xlsx', 'pptx'] as const;
export type TargetFormat = (typeof ALLOWED_TARGET_FORMATS)[number];

const CONVERSION_TIMEOUT_MS = Number(process.env.CONVERSION_TIMEOUT_MS ?? 60_000);

@Injectable()
export class ConversionService {
  private readonly logger = new Logger(ConversionService.name);

  constructor(private readonly prisma: PrismaService) {}

  async convert(file: Express.Multer.File, targetFormat: TargetFormat): Promise<Buffer> {
    const sourceFormat = (file.originalname.split('.').pop() ?? 'unknown').toLowerCase();
    const startedAt = Date.now();

    const job = await this.prisma.conversionJob.create({
      data: {
        originalFilename: file.originalname,
        sourceFormat,
        targetFormat,
        status: 'PROCESSING',
      },
    });

    // Unique workDir + LibreOffice profile per request: concurrent soffice
    // processes sharing a profile dir will lock each other out.
    const workDir = await mkdtemp(join(tmpdir(), 'brief-ai-convert-'));
    const profileDir = join(workDir, 'profile');
    const inputPath = join(workDir, `input.${sourceFormat}`);

    try {
      await writeFile(inputPath, file.buffer);
      await this.runSoffice(inputPath, workDir, profileDir, targetFormat);

      const outputFiles = await readdir(workDir);
      const outputName = outputFiles.find((name) => name.toLowerCase().endsWith(`.${targetFormat}`));
      if (!outputName) {
        throw new Error('Conversion produced no output file.');
      }
      const outputBuffer = await readFile(join(workDir, outputName));

      await this.prisma.conversionJob.update({
        where: { id: job.id },
        data: { status: 'SUCCESS', durationMs: Date.now() - startedAt },
      });

      return outputBuffer;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown conversion error';
      this.logger.error(`Conversion ${job.id} failed: ${message}`);
      await this.prisma.conversionJob.update({
        where: { id: job.id },
        data: { status: 'FAILED', errorMessage: message.slice(0, 2000), durationMs: Date.now() - startedAt },
      });
      throw err;
    } finally {
      await rm(workDir, { recursive: true, force: true });
    }
  }

  private runSoffice(
    inputPath: string,
    outDir: string,
    profileDir: string,
    targetFormat: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const args = [
        '--headless',
        '--nologo',
        '--nofirststartwizard',
        '--norestore',
        `-env:UserInstallation=file://${profileDir}`,
        '--convert-to',
        targetFormat,
        '--outdir',
        outDir,
        inputPath,
      ];
      const proc = spawn(process.env.SOFFICE_BIN ?? 'soffice', args);

      const timer = setTimeout(() => {
        proc.kill('SIGKILL');
        reject(new Error('Conversion timed out.'));
      }, CONVERSION_TIMEOUT_MS);

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
        else reject(new Error(`soffice exited with code ${code}: ${stderr.trim()}`));
      });
    });
  }
}
