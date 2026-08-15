import DuplicatePaymentDetector from '@/components/DuplicatePaymentDetector';
import RequirePaidPlan from '@/components/RequirePaidPlan';

export default function DuplicatePaymentsPage() {
  return (
    <RequirePaidPlan>
      <DuplicatePaymentDetector />
    </RequirePaidPlan>
  );
}
