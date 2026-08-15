import RedactionDetector from '@/components/RedactionDetector';
import RequirePaidPlan from '@/components/RequirePaidPlan';

export default function RedactionDetectorPage() {
  return (
    <RequirePaidPlan>
      <RedactionDetector />
    </RequirePaidPlan>
  );
}
