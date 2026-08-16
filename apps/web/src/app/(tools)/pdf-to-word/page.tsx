import PdfToOfficeTool from '@/components/PdfToOfficeTool';
import RequirePaidPlan from '@/components/RequirePaidPlan';

export default function PdfToWordPage() {
  return (
    <RequirePaidPlan featureKey="PDF_TO_WORD">
      <PdfToOfficeTool family="word" />
    </RequirePaidPlan>
  );
}
