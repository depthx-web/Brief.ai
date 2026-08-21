import OrganizePdf from '@/components/OrganizePdf';

import { getToolMetadata } from '@/lib/toolMetadata';

export async function generateMetadata() {
  return getToolMetadata('organize');
}

export default function OrganizePage() {
  return <OrganizePdf />;
}
