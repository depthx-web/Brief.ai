import PdfToOfficeTool from '@/components/PdfToOfficeTool';
import RequirePaidPlan from '@/components/RequirePaidPlan';

export default function PdfToExcelPage() {
  return (
    <RequirePaidPlan featureKey="PDF_TO_EXCEL">
      <PdfToOfficeTool family="excel" />
    </RequirePaidPlan>
  );
}
