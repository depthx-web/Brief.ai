import OfficeToPdfTool from '@/components/OfficeToPdfTool';
import RequirePaidPlan from '@/components/RequirePaidPlan';

import { getToolMetadata } from '@/lib/toolMetadata';

export async function generateMetadata() {
  return getToolMetadata('word-to-pdf');
}

export default function WordToPdfPage() {
  return (
    <RequirePaidPlan featureKey="WORD_TO_PDF">
      <OfficeToPdfTool family="word" />
    </RequirePaidPlan>
  );
}
