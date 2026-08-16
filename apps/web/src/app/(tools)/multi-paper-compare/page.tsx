import MultiPaperCompare from '@/components/MultiPaperCompare';
import RequirePaidPlan from '@/components/RequirePaidPlan';

export default function MultiPaperComparePage() {
  return (
    <RequirePaidPlan featureKey="COMPARE_PAPERS" segment="RESEARCHER">
      <MultiPaperCompare />
    </RequirePaidPlan>
  );
}
