import MethodologyExtractor from '@/components/MethodologyExtractor';
import RequirePaidPlan from '@/components/RequirePaidPlan';

export default function MethodologyExtractorPage() {
  return (
    <RequirePaidPlan featureKey="EXTRACT_METHODOLOGY" segment="RESEARCHER">
      <MethodologyExtractor />
    </RequirePaidPlan>
  );
}
