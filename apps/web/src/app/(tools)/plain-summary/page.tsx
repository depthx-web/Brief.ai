import PlainLanguageSummary from '@/components/PlainLanguageSummary';
import RequirePaidPlan from '@/components/RequirePaidPlan';

import { getToolMetadata } from '@/lib/toolMetadata';

export async function generateMetadata() {
  return getToolMetadata('plain-summary');
}

export default function PlainSummaryPage() {
  return (
    <RequirePaidPlan featureKey="SUMMARIZE_PLAIN" segment="LAWYER">
      <PlainLanguageSummary />
    </RequirePaidPlan>
  );
}
