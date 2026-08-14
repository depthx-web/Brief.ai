import { copyFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const workerSource = fileURLToPath(import.meta.resolve('pdfjs-dist/build/pdf.worker.min.mjs'));
const publicDir = path.join(process.cwd(), 'public');
const dest = path.join(publicDir, 'pdf.worker.min.mjs');

mkdirSync(publicDir, { recursive: true });
copyFileSync(workerSource, dest);
console.log(`Copied pdf.js worker to ${dest}`);
