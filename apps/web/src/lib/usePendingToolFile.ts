'use client';

import { useEffect } from 'react';
import { consumePendingToolFile } from './pendingToolFile';

// Call once on mount in any single-file tool page — if the user arrived via
// the Tools page's "Choose from Library" or "Upload a new file" flow, this
// hands the resolved File straight to the tool's own onFile/onFileSelect
// handler instead of leaving them to pick it again.
export function usePendingToolFile(onFile: (file: File) => void): void {
  useEffect(() => {
    const file = consumePendingToolFile();
    if (file) onFile(file);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
