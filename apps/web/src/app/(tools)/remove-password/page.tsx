import RemovePasswordPdf from '@/components/RemovePasswordPdf';
import LocalOrPaidGate from '@/components/LocalOrPaidGate';

export default function RemovePasswordPage() {
  return (
    <LocalOrPaidGate featureKey="REMOVE_PASSWORD">
      <RemovePasswordPdf />
    </LocalOrPaidGate>
  );
}
