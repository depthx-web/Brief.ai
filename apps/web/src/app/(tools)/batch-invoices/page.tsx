import BatchInvoices from '@/components/BatchInvoices';
import RequirePaidPlan from '@/components/RequirePaidPlan';

export default function BatchInvoicesPage() {
  return (
    <RequirePaidPlan featureKey="EXTRACT_INVOICE" segment="ACCOUNTANT">
      <BatchInvoices />
    </RequirePaidPlan>
  );
}
