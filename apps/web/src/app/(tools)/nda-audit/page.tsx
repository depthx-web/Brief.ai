import NdaAuditor from '@/components/NdaAuditor';
import RequirePaidPlan from '@/components/RequirePaidPlan';

import { getToolMetadata } from '@/lib/toolMetadata';

export async function generateMetadata() {
  return getToolMetadata('nda-audit');
}

export default function NdaAuditPage() {
  return (
    <RequirePaidPlan featureKey="AUDIT_NDA" segment="LAWYER">
      <NdaAuditor />
    </RequirePaidPlan>
  );
}
