import OfficeToPdfTool from '@/components/OfficeToPdfTool';
import RequirePaidPlan from '@/components/RequirePaidPlan';

import { getToolMetadata } from '@/lib/toolMetadata';

export async function generateMetadata() {
  return getToolMetadata('excel-to-pdf');
}

export default function ExcelToPdfPage() {
  return (
    <RequirePaidPlan featureKey="EXCEL_TO_PDF">
      <OfficeToPdfTool family="excel" />
    </RequirePaidPlan>
  );
}
