import { Suspense } from 'react';
import TeamInviteAccept from '@/components/TeamInviteAccept';

export default function TeamInvitePage() {
  return (
    <Suspense fallback={null}>
      <TeamInviteAccept />
    </Suspense>
  );
}
