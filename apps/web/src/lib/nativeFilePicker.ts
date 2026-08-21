import { isTauri } from './platform';

async function readAsFile(path: string): Promise<File> {
  const { readFile } = await import('@tauri-apps/plugin-fs');
  const bytes = await readFile(path);
  const filename = path.split(/[\\/]/).pop() ?? 'document.pdf';
  return new File([bytes], filename, { type: 'application/pdf' });
}

// Used by ToolSourceModal to skip its own "choose a source" UI on desktop —
// picking straight from the OS dialog is the whole point of item 13 (no
// extra modal/toolbar step between clicking a tool and picking a file).
// PDF-only: every caller of ToolSourceModal is a PDF-input tool.
export async function pickPdfFileNative(): Promise<File | null> {
  if (!isTauri()) return null;
  const { open } = await import('@tauri-apps/plugin-dialog');
  const path = await open({ multiple: false, filters: [{ name: 'PDF', extensions: ['pdf'] }] });
  if (!path || Array.isArray(path)) return null;
  return readAsFile(path);
}

// Multi-select variant for tools that take several files at once (Merge)
// and don't go through ToolSourceModal, since that modal is PDF-single-file
// only. Returns [] rather than null on cancel, matching a FileList's shape.
export async function pickPdfFilesNative(): Promise<File[]> {
  if (!isTauri()) return [];
  const { open } = await import('@tauri-apps/plugin-dialog');
  const paths = await open({ multiple: true, filters: [{ name: 'PDF', extensions: ['pdf'] }] });
  if (!paths) return [];
  const list = Array.isArray(paths) ? paths : [paths];
  return Promise.all(list.map(readAsFile));
}
