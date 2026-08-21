import OcrPdf from '@/components/OcrPdf';

import { getToolMetadata } from '@/lib/toolMetadata';

export async function generateMetadata() {
  return getToolMetadata('ocr');
}

export default function OcrPage() {
  return <OcrPdf />;
}
