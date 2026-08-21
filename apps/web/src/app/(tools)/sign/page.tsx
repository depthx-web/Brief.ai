import SignPdf from '@/components/SignPdf';

import { getToolMetadata } from '@/lib/toolMetadata';

export async function generateMetadata() {
  return getToolMetadata('sign');
}

export default function SignPage() {
  return <SignPdf />;
}
