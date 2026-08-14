import PdfToOffice from '@/components/PdfToOffice';
import RequirePaidPlan from '@/components/RequirePaidPlan';

export default function PdfToOfficePage() {
  return (
    <RequirePaidPlan>
      <PdfToOffice />
    </RequirePaidPlan>
  );
}
