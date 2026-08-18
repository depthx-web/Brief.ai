import PdfToHtmlPdf from '@/components/PdfToHtmlPdf';
import LocalOrPaidGate from '@/components/LocalOrPaidGate';

export default function PdfToHtmlPage() {
  return (
    <LocalOrPaidGate featureKey="PDF_TO_HTML">
      <PdfToHtmlPdf />
    </LocalOrPaidGate>
  );
}
