import OfficeToPdfTool from '@/components/OfficeToPdfTool';
import RequirePaidPlan from '@/components/RequirePaidPlan';

export default function ExcelToPdfPage() {
  return (
    <RequirePaidPlan featureKey="EXCEL_TO_PDF">
      <OfficeToPdfTool family="excel" />
    </RequirePaidPlan>
  );
}
