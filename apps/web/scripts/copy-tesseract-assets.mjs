import { copyFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const publicDir = path.join(process.cwd(), 'public', 'tesseract');
mkdirSync(publicDir, { recursive: true });

const workerSrc = fileURLToPath(import.meta.resolve('tesseract.js/dist/worker.min.js'));
copyFileSync(workerSrc, path.join(publicDir, 'worker.min.js'));

// SIMD+LSTM build: tesseract.js's recommended default for accuracy/speed.
const coreFiles = ['tesseract-core-simd-lstm.wasm.js', 'tesseract-core-simd-lstm.wasm'];
for (const file of coreFiles) {
  const src = fileURLToPath(import.meta.resolve(`tesseract.js-core/${file}`));
  copyFileSync(src, path.join(publicDir, file));
}

console.log(`Copied tesseract.js worker + core to ${publicDir}`);
