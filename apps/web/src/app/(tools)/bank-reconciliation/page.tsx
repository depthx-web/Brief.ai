import BankReconciliation from '@/components/BankReconciliation';
import RequirePaidPlan from '@/components/RequirePaidPlan';

export default function BankReconciliationPage() {
  return (
    <RequirePaidPlan>
      <BankReconciliation />
    </RequirePaidPlan>
  );
}
