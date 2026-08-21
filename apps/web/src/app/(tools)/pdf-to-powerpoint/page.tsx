import PdfToOfficeTool from '@/components/PdfToOfficeTool';
import RequirePaidPlan from '@/components/RequirePaidPlan';

import { getToolMetadata } from '@/lib/toolMetadata';

export async function generateMetadata() {
  return getToolMetadata('pdf-to-powerpoint');
}

export default function PdfToPowerpointPage() {
  return (
    <RequirePaidPlan featureKey="PDF_TO_POWERPOINT">
      <PdfToOfficeTool family="powerpoint" />
    </RequirePaidPlan>
  );
}
