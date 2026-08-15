import NdaAuditor from '@/components/NdaAuditor';
import RequirePaidPlan from '@/components/RequirePaidPlan';

export default function NdaAuditPage() {
  return (
    <RequirePaidPlan>
      <NdaAuditor />
    </RequirePaidPlan>
  );
}
