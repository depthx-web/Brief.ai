import MultiPaperCompare from '@/components/MultiPaperCompare';
import RequirePaidPlan from '@/components/RequirePaidPlan';

export default function MultiPaperComparePage() {
  return (
    <RequirePaidPlan>
      <MultiPaperCompare />
    </RequirePaidPlan>
  );
}
