import RotatePdf from '@/components/RotatePdf';

import { getToolMetadata } from '@/lib/toolMetadata';

export async function generateMetadata() {
  return getToolMetadata('rotate');
}

export default function RotatePage() {
  return <RotatePdf />;
}
