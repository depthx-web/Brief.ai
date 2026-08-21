import FinancialRatioAnalyzer from '@/components/FinancialRatioAnalyzer';
import RequirePaidPlan from '@/components/RequirePaidPlan';

import { getToolMetadata } from '@/lib/toolMetadata';

export async function generateMetadata() {
  return getToolMetadata('financial-ratios');
}

export default function FinancialRatiosPage() {
  return (
    <RequirePaidPlan featureKey="ANALYZE_FINANCIAL_RATIOS" segment="ACCOUNTANT">
      <FinancialRatioAnalyzer />
    </RequirePaidPlan>
  );
}
