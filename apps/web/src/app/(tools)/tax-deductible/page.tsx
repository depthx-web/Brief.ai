import TaxDeductibleFlagger from '@/components/TaxDeductibleFlagger';
import RequirePaidPlan from '@/components/RequirePaidPlan';

import { getToolMetadata } from '@/lib/toolMetadata';

export async function generateMetadata() {
  return getToolMetadata('tax-deductible');
}

export default function TaxDeductiblePage() {
  return (
    <RequirePaidPlan featureKey="FLAG_DEDUCTIBLE_EXPENSES" segment="ACCOUNTANT">
      <TaxDeductibleFlagger />
    </RequirePaidPlan>
  );
}
