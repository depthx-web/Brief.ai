import PageNumbersPdf from '@/components/PageNumbersPdf';

import { getToolMetadata } from '@/lib/toolMetadata';

export async function generateMetadata() {
  return getToolMetadata('page-numbers');
}

export default function PageNumbersPage() {
  return <PageNumbersPdf />;
}
