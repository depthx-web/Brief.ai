import ProtectPdf from '@/components/ProtectPdf';
import RequirePaidPlan from '@/components/RequirePaidPlan';

export default function ProtectPage() {
  return (
    <RequirePaidPlan featureKey="PROTECT_PDF">
      <ProtectPdf />
    </RequirePaidPlan>
  );
}
