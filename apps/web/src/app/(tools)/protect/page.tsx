import ProtectPdf from '@/components/ProtectPdf';
import LocalOrPaidGate from '@/components/LocalOrPaidGate';

export default function ProtectPage() {
  return (
    <LocalOrPaidGate featureKey="PROTECT_PDF">
      <ProtectPdf />
    </LocalOrPaidGate>
  );
}
