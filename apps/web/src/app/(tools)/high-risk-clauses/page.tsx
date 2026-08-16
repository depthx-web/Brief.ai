import HighRiskClauseDetector from '@/components/HighRiskClauseDetector';
import RequirePaidPlan from '@/components/RequirePaidPlan';

export default function HighRiskClausesPage() {
  return (
    <RequirePaidPlan featureKey="ANALYZE_CLAUSES" segment="LAWYER">
      <HighRiskClauseDetector />
    </RequirePaidPlan>
  );
}
