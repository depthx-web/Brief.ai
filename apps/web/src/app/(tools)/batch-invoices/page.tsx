import BatchInvoices from '@/components/BatchInvoices';
import RequirePaidPlan from '@/components/RequirePaidPlan';

import { getToolMetadata } from '@/lib/toolMetadata';

export async function generateMetadata() {
  return getToolMetadata('batch-invoices');
}

export default function BatchInvoicesPage() {
  return (
    <RequirePaidPlan featureKey="EXTRACT_INVOICE" segment="ACCOUNTANT">
      <BatchInvoices />
    </RequirePaidPlan>
  );
}
