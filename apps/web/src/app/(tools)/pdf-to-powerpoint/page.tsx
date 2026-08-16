import PdfToOfficeTool from '@/components/PdfToOfficeTool';
import RequirePaidPlan from '@/components/RequirePaidPlan';

export default function PdfToPowerpointPage() {
  return (
    <RequirePaidPlan featureKey="PDF_TO_POWERPOINT">
      <PdfToOfficeTool family="powerpoint" />
    </RequirePaidPlan>
  );
}
