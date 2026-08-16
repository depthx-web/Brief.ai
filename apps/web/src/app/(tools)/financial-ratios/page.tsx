import FinancialRatioAnalyzer from '@/components/FinancialRatioAnalyzer';
import RequirePaidPlan from '@/components/RequirePaidPlan';

export default function FinancialRatiosPage() {
  return (
    <RequirePaidPlan featureKey="ANALYZE_FINANCIAL_RATIOS" segment="ACCOUNTANT">
      <FinancialRatioAnalyzer />
    </RequirePaidPlan>
  );
}
