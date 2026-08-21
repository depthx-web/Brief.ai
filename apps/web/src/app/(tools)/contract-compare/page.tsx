import ContractCompare from '@/components/ContractCompare';
import RequirePaidPlan from '@/components/RequirePaidPlan';

import { getToolMetadata } from '@/lib/toolMetadata';

export async function generateMetadata() {
  return getToolMetadata('contract-compare');
}

export default function ContractComparePage() {
  return (
    <RequirePaidPlan featureKey="COMPARE_CONTRACTS" segment="LAWYER">
      <ContractCompare />
    </RequirePaidPlan>
  );
}
