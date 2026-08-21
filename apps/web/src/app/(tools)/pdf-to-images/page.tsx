import PdfToImages from '@/components/PdfToImages';

import { getToolMetadata } from '@/lib/toolMetadata';

export async function generateMetadata() {
  return getToolMetadata('pdf-to-images');
}

export default function PdfToImagesPage() {
  return <PdfToImages />;
}
