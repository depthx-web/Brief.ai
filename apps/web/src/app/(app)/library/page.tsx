'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import MyLibrary from '@/components/MyLibrary';
import ProjectDetail from '@/components/ProjectDetail';

// projectId lives in a query param, not a dynamic route segment ([projectId]
// was removed) — Tauri's static-export build can't generate params for
// arbitrary user project IDs at build time, so this has to resolve client-side.
function LibraryPageInner() {
  const projectId = useSearchParams().get('projectId');
  return projectId ? <ProjectDetail projectId={projectId} /> : <MyLibrary />;
}

export default function LibraryPage() {
  return (
    <Suspense fallback={null}>
      <LibraryPageInner />
    </Suspense>
  );
}
