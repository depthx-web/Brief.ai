import PdfToOfficeTool from '@/components/PdfToOfficeTool';
import RequirePaidPlan from '@/components/RequirePaidPlan';

import { getToolMetadata } from '@/lib/toolMetadata';

export async function generateMetadata() {
  return getToolMetadata('pdf-to-word');
}

export default function PdfToWordPage() {
  return (
    <RequirePaidPlan featureKey="PDF_TO_WORD">
      <PdfToOfficeTool family="word" />
    </RequirePaidPlan>
  );
}
