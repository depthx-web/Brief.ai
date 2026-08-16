import PresentationOutline from '@/components/PresentationOutline';
import RequirePaidPlan from '@/components/RequirePaidPlan';

export default function PresentationOutlinePage() {
  return (
    <RequirePaidPlan featureKey="GENERATE_OUTLINE" segment="RESEARCHER">
      <PresentationOutline />
    </RequirePaidPlan>
  );
}
