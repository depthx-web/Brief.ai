import BankReconciliation from '@/components/BankReconciliation';
import RequirePaidPlan from '@/components/RequirePaidPlan';

export default function BankReconciliationPage() {
  return (
    <RequirePaidPlan featureKey="RECONCILE_BANK" segment="ACCOUNTANT">
      <BankReconciliation />
    </RequirePaidPlan>
  );
}
