import CompressHighRatioPdf from '@/components/CompressHighRatioPdf';
import RequirePaidPlan from '@/components/RequirePaidPlan';

export default function CompressHighRatioPage() {
  return (
    <RequirePaidPlan featureKey="COMPRESS_HIGH_RATIO">
      <CompressHighRatioPdf />
    </RequirePaidPlan>
  );
}
