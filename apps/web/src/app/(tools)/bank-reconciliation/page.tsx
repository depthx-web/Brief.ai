import BankReconciliation from '@/components/BankReconciliation';
import RequirePaidPlan from '@/components/RequirePaidPlan';

import { getToolMetadata } from '@/lib/toolMetadata';

export async function generateMetadata() {
  return getToolMetadata('bank-reconciliation');
}

export default function BankReconciliationPage() {
  return (
    <RequirePaidPlan featureKey="RECONCILE_BANK" segment="ACCOUNTANT">
      <BankReconciliation />
    </RequirePaidPlan>
  );
}
