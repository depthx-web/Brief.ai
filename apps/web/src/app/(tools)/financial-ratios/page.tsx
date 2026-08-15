import FinancialRatioAnalyzer from '@/components/FinancialRatioAnalyzer';
import RequirePaidPlan from '@/components/RequirePaidPlan';

export default function FinancialRatiosPage() {
  return (
    <RequirePaidPlan>
      <FinancialRatioAnalyzer />
    </RequirePaidPlan>
  );
}
