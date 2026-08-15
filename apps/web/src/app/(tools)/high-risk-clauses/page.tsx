import HighRiskClauseDetector from '@/components/HighRiskClauseDetector';
import RequirePaidPlan from '@/components/RequirePaidPlan';

export default function HighRiskClausesPage() {
  return (
    <RequirePaidPlan>
      <HighRiskClauseDetector />
    </RequirePaidPlan>
  );
}
