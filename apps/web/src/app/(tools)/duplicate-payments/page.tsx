import DuplicatePaymentDetector from '@/components/DuplicatePaymentDetector';
import RequirePaidPlan from '@/components/RequirePaidPlan';

export default function DuplicatePaymentsPage() {
  return (
    <RequirePaidPlan featureKey="DETECT_DUPLICATE_PAYMENTS" segment="ACCOUNTANT">
      <DuplicatePaymentDetector />
    </RequirePaidPlan>
  );
}
