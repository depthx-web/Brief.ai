import PdfToHtmlPdf from '@/components/PdfToHtmlPdf';
import RequirePaidPlan from '@/components/RequirePaidPlan';

export default function PdfToHtmlPage() {
  return (
    <RequirePaidPlan featureKey="PDF_TO_HTML">
      <PdfToHtmlPdf />
    </RequirePaidPlan>
  );
}
