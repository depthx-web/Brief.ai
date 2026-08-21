import RedactionDetector from '@/components/RedactionDetector';
import RequirePaidPlan from '@/components/RequirePaidPlan';

import { getToolMetadata } from '@/lib/toolMetadata';

export async function generateMetadata() {
  return getToolMetadata('redaction-detector');
}

export default function RedactionDetectorPage() {
  return (
    <RequirePaidPlan featureKey="DETECT_SENSITIVE_DATA" segment="LAWYER">
      <RedactionDetector />
    </RequirePaidPlan>
  );
}
