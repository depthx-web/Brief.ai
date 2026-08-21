import DuplicatePaymentDetector from '@/components/DuplicatePaymentDetector';
import RequirePaidPlan from '@/components/RequirePaidPlan';

import { getToolMetadata } from '@/lib/toolMetadata';

export async function generateMetadata() {
  return getToolMetadata('duplicate-payments');
}

export default function DuplicatePaymentsPage() {
  return (
    <RequirePaidPlan featureKey="DETECT_DUPLICATE_PAYMENTS" segment="ACCOUNTANT">
      <DuplicatePaymentDetector />
    </RequirePaidPlan>
  );
}
