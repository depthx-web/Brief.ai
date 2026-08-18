import { isTauri } from './platform';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

const MIME_TYPE: Record<string, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  html: 'text/html',
};

// Bridges a browser File into a Rust command that takes a file path and
// returns one: writes the file to a Tauri-managed temp path (invoke() can't
// carry a File object directly), invokes the command, reads the result back
// as a Blob, then cleans up both temp files. Passing paths instead of raw
// bytes through invoke()'s JSON layer matters for large scanned PDFs — a
// number[] of every byte would be needlessly slow to serialize.
async function invokeLocalFileOp(
  command: string,
  file: File,
  inputExtension: string,
  args: Record<string, unknown>,
  outputFilename: string,
  outputExtension: string
): Promise<{ blob: Blob; filename: string }> {
  const { invoke } = await import('@tauri-apps/api/core');
  const { writeFile, readFile, remove } = await import('@tauri-apps/plugin-fs');
  const { tempDir, join } = await import('@tauri-apps/api/path');

  const dir = await tempDir();
  const inputPath = await join(dir, `brief-ai-input-${crypto.randomUUID()}.${inputExtension}`);
  await writeFile(inputPath, new Uint8Array(await file.arrayBuffer()));

  let outputPath: string;
  try {
    outputPath = await invoke<string>(command, { inputPath, ...args });
  } finally {
    await remove(inputPath).catch(() => {});
  }

  const outputBytes = await readFile(outputPath);
  await remove(outputPath).catch(() => {});

  const mime = MIME_TYPE[outputExtension] ?? 'application/octet-stream';
  return { blob: new Blob([outputBytes], { type: mime }), filename: outputFilename };
}

async function postForm(
  path: string,
  formData: FormData,
  fallbackFilename: string
): Promise<{ blob: Blob; filename: string }> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { method: 'POST', body: formData });
  } catch {
    throw new Error(
      'Could not reach the conversion server. Make sure the API (docker compose) is running.'
    );
  }

  if (!response.ok) {
    let message = `Request failed (${response.status}).`;
    try {
      const body = await response.json();
      if (typeof body?.message === 'string') message = body.message;
    } catch {
      // response wasn't JSON — keep the generic message
    }
    throw new Error(message);
  }

  const disposition = response.headers.get('Content-Disposition') ?? '';
  const match = disposition.match(/filename="([^"]+)"/);
  const filename = match?.[1] ?? fallbackFilename;

  const blob = await response.blob();
  return { blob, filename };
}

export type OfficeFamily = 'word' | 'excel' | 'powerpoint';

const TARGET_EXTENSION: Record<OfficeFamily, string> = { word: 'docx', excel: 'xlsx', powerpoint: 'pptx' };

// One backend route per format per direction (not one generic /convert?to=)
// so each carries its own feature-gate — see ConversionController.
//
// Deliberately NOT routed through isTauri()'s local path like the other
// desktop-local tools: the Rust office_convert command (see
// apps/desktop/src-tauri/src/commands/office_worker.rs) hits an intermittent,
// unresolved deadlock in bundled LibreOffice's own Windows startup when
// launched as a descendant of the desktop app — confirmed via direct CPU
// sampling (genuinely stuck, not just slow), reproducing across four
// different Windows process-launch strategies. Office conversion falls back
// to the remote API on desktop too, same as web, until that's resolved.
export async function convertOfficeToPdf(file: File, family: OfficeFamily): Promise<{ blob: Blob; filename: string }> {
  const baseName = file.name.replace(/\.[^.]+$/, '');
  const formData = new FormData();
  formData.append('file', file);
  return postForm(`/convert/${family}-to-pdf`, formData, `${baseName}.pdf`);
}

export async function convertPdfToOffice(file: File, family: OfficeFamily): Promise<{ blob: Blob; filename: string }> {
  const baseName = file.name.replace(/\.[^.]+$/, '');
  const targetExtension = TARGET_EXTENSION[family];
  const formData = new FormData();
  formData.append('file', file);
  return postForm(`/convert/pdf-to-${family}`, formData, `${baseName}.${targetExtension}`);
}

// Passwords go in the multipart body (not the query string) so they don't
// end up in URLs, access logs, or browser history.
export async function protectPdf(
  file: File,
  password: string,
  ownerPassword?: string
): Promise<{ blob: Blob; filename: string }> {
  const baseName = file.name.replace(/\.pdf$/i, '');
  if (isTauri()) {
    return invokeLocalFileOp(
      'protect_pdf',
      file,
      'pdf',
      { userPassword: password, ownerPassword: ownerPassword ?? password },
      `${baseName}-protected.pdf`,
      'pdf'
    );
  }
  const formData = new FormData();
  formData.append('file', file);
  formData.append('password', password);
  if (ownerPassword) formData.append('ownerPassword', ownerPassword);
  return postForm('/protect', formData, `${baseName}-protected.pdf`);
}

export async function unlockPdf(
  file: File,
  password: string
): Promise<{ blob: Blob; filename: string }> {
  const baseName = file.name.replace(/\.pdf$/i, '');
  if (isTauri()) {
    return invokeLocalFileOp('unlock_pdf', file, 'pdf', { password }, `${baseName}-unlocked.pdf`, 'pdf');
  }
  const formData = new FormData();
  formData.append('file', file);
  formData.append('password', password);
  return postForm('/unlock', formData, `${baseName}-unlocked.pdf`);
}

// Real HTML via poppler's pdftohtml (server-side on web, local on desktop) —
// not a homebrewed text-layout reconstruction.
export async function convertPdfToHtml(file: File): Promise<{ blob: Blob; filename: string }> {
  const baseName = file.name.replace(/\.pdf$/i, '');
  if (isTauri()) {
    return invokeLocalFileOp('pdf_to_html', file, 'pdf', {}, `${baseName}.html`, 'html');
  }
  const formData = new FormData();
  formData.append('file', file);
  return postForm('/convert/pdf-to-html', formData, `${baseName}.html`);
}

export type CompressionPreset = 'ebook' | 'screen';

// Server-side, image-recompression-based (Ghostscript) — unlike the free
// client-side Compress tool, this keeps vector text selectable/searchable
// instead of rasterizing every page.
export async function compressHighRatio(file: File, preset: CompressionPreset): Promise<{ blob: Blob; filename: string }> {
  const baseName = file.name.replace(/\.pdf$/i, '');
  if (isTauri()) {
    return invokeLocalFileOp('compress_pdf', file, 'pdf', { preset }, `${baseName}-compressed.pdf`, 'pdf');
  }
  const formData = new FormData();
  formData.append('file', file);
  formData.append('preset', preset);
  return postForm('/compress/high-ratio', formData, `${baseName}-compressed.pdf`);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
