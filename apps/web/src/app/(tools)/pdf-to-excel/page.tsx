import PdfToOfficeTool from '@/components/PdfToOfficeTool';
import RequirePaidPlan from '@/components/RequirePaidPlan';

import { getToolMetadata } from '@/lib/toolMetadata';

export async function generateMetadata() {
  return getToolMetadata('pdf-to-excel');
}

export default function PdfToExcelPage() {
  return (
    <RequirePaidPlan featureKey="PDF_TO_EXCEL">
      <PdfToOfficeTool family="excel" />
    </RequirePaidPlan>
  );
}
