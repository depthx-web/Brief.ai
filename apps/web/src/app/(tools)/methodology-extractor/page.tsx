import MethodologyExtractor from '@/components/MethodologyExtractor';
import RequirePaidPlan from '@/components/RequirePaidPlan';

import { getToolMetadata } from '@/lib/toolMetadata';

export async function generateMetadata() {
  return getToolMetadata('methodology-extractor');
}

export default function MethodologyExtractorPage() {
  return (
    <RequirePaidPlan featureKey="EXTRACT_METHODOLOGY" segment="RESEARCHER">
      <MethodologyExtractor />
    </RequirePaidPlan>
  );
}
