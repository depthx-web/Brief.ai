import ImagesToPdf from '@/components/ImagesToPdf';

import { getToolMetadata } from '@/lib/toolMetadata';

export async function generateMetadata() {
  return getToolMetadata('images-to-pdf');
}

export default function ImagesToPdfPage() {
  return <ImagesToPdf />;
}
