import PdfToHtmlPdf from '@/components/PdfToHtmlPdf';
import LocalOrPaidGate from '@/components/LocalOrPaidGate';

import { getToolMetadata } from '@/lib/toolMetadata';

export async function generateMetadata() {
  return getToolMetadata('pdf-to-html');
}

export default function PdfToHtmlPage() {
  return (
    <LocalOrPaidGate featureKey="PDF_TO_HTML">
      <PdfToHtmlPdf />
    </LocalOrPaidGate>
  );
}
