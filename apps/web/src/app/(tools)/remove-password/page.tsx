import RemovePasswordPdf from '@/components/RemovePasswordPdf';
import LocalOrPaidGate from '@/components/LocalOrPaidGate';

import { getToolMetadata } from '@/lib/toolMetadata';

export async function generateMetadata() {
  return getToolMetadata('remove-password');
}

export default function RemovePasswordPage() {
  return (
    <LocalOrPaidGate featureKey="REMOVE_PASSWORD">
      <RemovePasswordPdf />
    </LocalOrPaidGate>
  );
}
