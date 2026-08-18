// The Tauri v2 runtime marker. Deliberately a plain window check (not an
// `@tauri-apps/api` import) so this file has zero footprint in the Vercel
// web bundle — every caller that needs the actual Tauri APIs imports them
// dynamically, only inside the branch this returns true for.
export function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}
