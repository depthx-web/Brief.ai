import WatermarkPdf from '@/components/WatermarkPdf';

import { getToolMetadata } from '@/lib/toolMetadata';

export async function generateMetadata() {
  return getToolMetadata('watermark');
}

export default function WatermarkPage() {
  return <WatermarkPdf />;
}
