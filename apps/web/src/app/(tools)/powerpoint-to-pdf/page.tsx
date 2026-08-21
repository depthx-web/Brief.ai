import OfficeToPdfTool from '@/components/OfficeToPdfTool';
import RequirePaidPlan from '@/components/RequirePaidPlan';

import { getToolMetadata } from '@/lib/toolMetadata';

export async function generateMetadata() {
  return getToolMetadata('powerpoint-to-pdf');
}

export default function PowerpointToPdfPage() {
  return (
    <RequirePaidPlan featureKey="POWERPOINT_TO_PDF">
      <OfficeToPdfTool family="powerpoint" />
    </RequirePaidPlan>
  );
}
