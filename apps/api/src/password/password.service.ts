import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PrismaService } from '../prisma/prisma.service';

const TIMEOUT_MS = Number(process.env.CONVERSION_TIMEOUT_MS ?? 60_000);

@Injectable()
export class PasswordService {
  private readonly logger = new Logger(PasswordService.name);

  constructor(private readonly prisma: PrismaService) {}

  async protect(file: Express.Multer.File, userPassword: string, ownerPassword: string): Promise<Buffer> {
    return this.run(file, 'PROTECT', (inputPath, outputPath) =>
      this.runQpdf([
        '--encrypt',
        userPassword,
        ownerPassword || userPassword,
        '256',
        '--',
        inputPath,
        outputPath,
      ])
    );
  }

  async unlock(file: Express.Multer.File, password: string): Promise<Buffer> {
    return this.run(file, 'UNLOCK', (inputPath, outputPath) =>
      this.runQpdf([`--password=${password}`, '--decrypt', inputPath, outputPath])
    );
  }

  private async run(
    file: Express.Multer.File,
    operation: 'PROTECT' | 'UNLOCK',
    task: (inputPath: string, outputPath: string) => Promise<void>
  ): Promise<Buffer> {
    const startedAt = Date.now();
    const job = await this.prisma.passwordJob.create({
      data: { originalFilename: file.originalname, operation, status: 'PROCESSING' },
    });

    const workDir = await mkdtemp(join(tmpdir(), 'brief-ai-password-'));
    const inputPath = join(workDir, 'input.pdf');
    const outputPath = join(workDir, 'output.pdf');

    try {
      await writeFile(inputPath, file.buffer);
      await task(inputPath, outputPath);
      const outputBuffer = await readFile(outputPath);

      await this.prisma.passwordJob.update({
        where: { id: job.id },
        data: { status: 'SUCCESS', durationMs: Date.now() - startedAt },
      });
      return outputBuffer;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Password job ${job.id} (${operation}) failed: ${message}`);
      await this.prisma.passwordJob.update({
        where: { id: job.id },
        data: { status: 'FAILED', errorMessage: message.slice(0, 2000), durationMs: Date.now() - startedAt },
      });
      throw err;
    } finally {
      await rm(workDir, { recursive: true, force: true });
    }
  }

  private runQpdf(args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const proc = spawn(process.env.QPDF_BIN ?? 'qpdf', args);

      const timer = setTimeout(() => {
        proc.kill('SIGKILL');
        reject(new Error('Operation timed out.'));
      }, TIMEOUT_MS);

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
        else reject(new Error(stderr.trim() || `qpdf exited with code ${code}`));
      });
    });
  }
}
