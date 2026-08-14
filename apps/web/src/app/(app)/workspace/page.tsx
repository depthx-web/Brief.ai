import { Suspense } from 'react';
import Workspace from '@/components/Workspace';

export default function WorkspacePage() {
  return (
    <Suspense fallback={null}>
      <Workspace />
    </Suspense>
  );
}
