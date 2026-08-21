import { isTauri } from './platform';

// Used by ToolSourceModal to skip its own "choose a source" UI on desktop —
// picking straight from the OS dialog is the whole point of item 13 (no
// extra modal/toolbar step between clicking a tool and picking a file).
// PDF-only: every caller of ToolSourceModal is a PDF-input tool.
export async function pickPdfFileNative(): Promise<File | null> {
  if (!isTauri()) return null;
  const { open } = await import('@tauri-apps/plugin-dialog');
  const { readFile } = await import('@tauri-apps/plugin-fs');
  const path = await open({ multiple: false, filters: [{ name: 'PDF', extensions: ['pdf'] }] });
  if (!path || Array.isArray(path)) return null;
  const bytes = await readFile(path);
  const filename = path.split(/[\\/]/).pop() ?? 'document.pdf';
  return new File([bytes], filename, { type: 'application/pdf' });
}
