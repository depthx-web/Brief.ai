import BatchInvoices from '@/components/BatchInvoices';
import RequirePaidPlan from '@/components/RequirePaidPlan';

export default function BatchInvoicesPage() {
  return (
    <RequirePaidPlan>
      <BatchInvoices />
    </RequirePaidPlan>
  );
}
