import ProtectPdf from '@/components/ProtectPdf';
import LocalOrPaidGate from '@/components/LocalOrPaidGate';

import { getToolMetadata } from '@/lib/toolMetadata';

export async function generateMetadata() {
  return getToolMetadata('protect');
}

export default function ProtectPage() {
  return (
    <LocalOrPaidGate featureKey="PROTECT_PDF">
      <ProtectPdf />
    </LocalOrPaidGate>
  );
}
