import RedactionDetector from '@/components/RedactionDetector';
import RequirePaidPlan from '@/components/RequirePaidPlan';

export default function RedactionDetectorPage() {
  return (
    <RequirePaidPlan featureKey="DETECT_SENSITIVE_DATA" segment="LAWYER">
      <RedactionDetector />
    </RequirePaidPlan>
  );
}
