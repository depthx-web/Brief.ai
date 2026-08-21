import PresentationOutline from '@/components/PresentationOutline';
import RequirePaidPlan from '@/components/RequirePaidPlan';

import { getToolMetadata } from '@/lib/toolMetadata';

export async function generateMetadata() {
  return getToolMetadata('presentation-outline');
}

export default function PresentationOutlinePage() {
  return (
    <RequirePaidPlan featureKey="GENERATE_OUTLINE" segment="RESEARCHER">
      <PresentationOutline />
    </RequirePaidPlan>
  );
}
