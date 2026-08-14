import RemovePasswordPdf from '@/components/RemovePasswordPdf';
import RequirePaidPlan from '@/components/RequirePaidPlan';

export default function RemovePasswordPage() {
  return (
    <RequirePaidPlan>
      <RemovePasswordPdf />
    </RequirePaidPlan>
  );
}
