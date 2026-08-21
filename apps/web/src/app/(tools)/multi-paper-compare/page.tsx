import MultiPaperCompare from '@/components/MultiPaperCompare';
import RequirePaidPlan from '@/components/RequirePaidPlan';

import { getToolMetadata } from '@/lib/toolMetadata';

export async function generateMetadata() {
  return getToolMetadata('multi-paper-compare');
}

export default function MultiPaperComparePage() {
  return (
    <RequirePaidPlan featureKey="COMPARE_PAPERS" segment="RESEARCHER">
      <MultiPaperCompare />
    </RequirePaidPlan>
  );
}
