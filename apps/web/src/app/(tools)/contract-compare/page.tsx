import ContractCompare from '@/components/ContractCompare';
import RequirePaidPlan from '@/components/RequirePaidPlan';

export default function ContractComparePage() {
  return (
    <RequirePaidPlan featureKey="COMPARE_CONTRACTS" segment="LAWYER">
      <ContractCompare />
    </RequirePaidPlan>
  );
}
