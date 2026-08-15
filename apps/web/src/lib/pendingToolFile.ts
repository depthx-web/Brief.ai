// A tool card's file-source modal (Batch 3, Section 4) resolves a File
// object — either freshly picked from disk or fetched from the Library —
// before navigating to the tool's own page. Since that's a client-side
// route push, not a full reload, a module-level handoff survives the trip
// without needing sessionStorage/base64 round-tripping of PDF bytes.
let pendingFile: File | null = null;

export function setPendingToolFile(file: File): void {
  pendingFile = file;
}

export function consumePendingToolFile(): File | null {
  const file = pendingFile;
  pendingFile = null;
  return file;
}
