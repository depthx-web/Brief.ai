import HighRiskClauseDetector from '@/components/HighRiskClauseDetector';
import RequirePaidPlan from '@/components/RequirePaidPlan';

import { getToolMetadata } from '@/lib/toolMetadata';

export async function generateMetadata() {
  return getToolMetadata('high-risk-clauses');
}

export default function HighRiskClausesPage() {
  return (
    <RequirePaidPlan featureKey="ANALYZE_CLAUSES" segment="LAWYER">
      <HighRiskClauseDetector />
    </RequirePaidPlan>
  );
}
