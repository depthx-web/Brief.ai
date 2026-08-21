import SplitPdf from '@/components/SplitPdf';

import { getToolMetadata } from '@/lib/toolMetadata';

export async function generateMetadata() {
  return getToolMetadata('split');
}

export default function SplitPage() {
  return <SplitPdf />;
}
