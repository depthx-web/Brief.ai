import CompressHighRatioPdf from '@/components/CompressHighRatioPdf';
import LocalOrPaidGate from '@/components/LocalOrPaidGate';

import { getToolMetadata } from '@/lib/toolMetadata';

export async function generateMetadata() {
  return getToolMetadata('compress-high-ratio');
}

export default function CompressHighRatioPage() {
  return (
    <LocalOrPaidGate featureKey="COMPRESS_HIGH_RATIO">
      <CompressHighRatioPdf />
    </LocalOrPaidGate>
  );
}
