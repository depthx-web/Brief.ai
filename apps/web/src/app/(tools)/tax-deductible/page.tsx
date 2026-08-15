import TaxDeductibleFlagger from '@/components/TaxDeductibleFlagger';
import RequirePaidPlan from '@/components/RequirePaidPlan';

export default function TaxDeductiblePage() {
  return (
    <RequirePaidPlan>
      <TaxDeductibleFlagger />
    </RequirePaidPlan>
  );
}
