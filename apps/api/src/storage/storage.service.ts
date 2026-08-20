import { Injectable } from '@nestjs/common';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

// Local disk for now — swap for S3-compatible object storage (the README's
// original plan) before any real deployment. Kept simple here since that
// would need its own account/credentials, same as every other provider
// decision in this project.
const STORAGE_DIR = process.env.STORAGE_DIR ?? join(process.cwd(), 'storage');

@Injectable()
export class StorageService {
  async save(buffer: Buffer, originalFilename: string): Promise<string> {
    await mkdir(STORAGE_DIR, { recursive: true });
    const extMatch = originalFilename.match(/\.([a-zA-Z0-9]+)$/);
    const ext = extMatch ? extMatch[1] : 'bin';
    const key = `${randomUUID()}.${ext}`;
    await writeFile(join(STORAGE_DIR, key), buffer);
    return key;
  }

  async read(key: string): Promise<Buffer> {
    return readFile(join(STORAGE_DIR, key));
  }

  // Used by "Duplicate" (Library file options menu) — copies the physical
  // file under a fresh key so the two documents don't share storage.
  async copy(key: string): Promise<string> {
    const ext = key.match(/\.([a-zA-Z0-9]+)$/)?.[1] ?? 'bin';
    const newKey = `${randomUUID()}.${ext}`;
    const buffer = await readFile(join(STORAGE_DIR, key));
    await writeFile(join(STORAGE_DIR, newKey), buffer);
    return newKey;
  }

  async delete(key: string): Promise<void> {
    await rm(join(STORAGE_DIR, key), { force: true });
  }
}
