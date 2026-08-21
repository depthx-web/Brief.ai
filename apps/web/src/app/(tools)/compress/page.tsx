import CompressPdf from '@/components/CompressPdf';

import { getToolMetadata } from '@/lib/toolMetadata';

export async function generateMetadata() {
  return getToolMetadata('compress');
}

export default function CompressPage() {
  return <CompressPdf />;
}
