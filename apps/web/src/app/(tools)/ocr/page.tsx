import OcrPdf from '@/components/OcrPdf';
import RequirePaidPlan from '@/components/RequirePaidPlan';

export default function OcrPage() {
  return (
    <RequirePaidPlan>
      <OcrPdf />
    </RequirePaidPlan>
  );
}
