import OfficeToPdfTool from '@/components/OfficeToPdfTool';
import RequirePaidPlan from '@/components/RequirePaidPlan';

export default function WordToPdfPage() {
  return (
    <RequirePaidPlan featureKey="WORD_TO_PDF">
      <OfficeToPdfTool family="word" />
    </RequirePaidPlan>
  );
}
