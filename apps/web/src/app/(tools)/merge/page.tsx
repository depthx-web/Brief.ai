import MergePdf from '@/components/MergePdf';

import { getToolMetadata } from '@/lib/toolMetadata';

export async function generateMetadata() {
  return getToolMetadata('merge');
}

export default function MergePage() {
  return <MergePdf />;
}
