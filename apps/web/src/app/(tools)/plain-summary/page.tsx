import PlainLanguageSummary from '@/components/PlainLanguageSummary';
import RequirePaidPlan from '@/components/RequirePaidPlan';

export default function PlainSummaryPage() {
  return (
    <RequirePaidPlan featureKey="SUMMARIZE_PLAIN" segment="LAWYER">
      <PlainLanguageSummary />
    </RequirePaidPlan>
  );
}
