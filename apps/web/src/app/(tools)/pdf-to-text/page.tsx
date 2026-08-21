import PdfToTextPdf from '@/components/PdfToTextPdf';

import { getToolMetadata } from '@/lib/toolMetadata';

export async function generateMetadata() {
  return getToolMetadata('pdf-to-text');
}

export default function PdfToTextPage() {
  return <PdfToTextPdf />;
}
