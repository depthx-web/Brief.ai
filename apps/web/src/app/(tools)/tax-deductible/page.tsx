import TaxDeductibleFlagger from '@/components/TaxDeductibleFlagger';
import RequirePaidPlan from '@/components/RequirePaidPlan';

export default function TaxDeductiblePage() {
  return (
    <RequirePaidPlan featureKey="FLAG_DEDUCTIBLE_EXPENSES" segment="ACCOUNTANT">
      <TaxDeductibleFlagger />
    </RequirePaidPlan>
  );
}
