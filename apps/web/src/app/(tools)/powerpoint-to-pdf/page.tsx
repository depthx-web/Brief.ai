import OfficeToPdfTool from '@/components/OfficeToPdfTool';
import RequirePaidPlan from '@/components/RequirePaidPlan';

export default function PowerpointToPdfPage() {
  return (
    <RequirePaidPlan featureKey="POWERPOINT_TO_PDF">
      <OfficeToPdfTool family="powerpoint" />
    </RequirePaidPlan>
  );
}
