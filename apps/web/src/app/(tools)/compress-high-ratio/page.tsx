import CompressHighRatioPdf from '@/components/CompressHighRatioPdf';
import LocalOrPaidGate from '@/components/LocalOrPaidGate';

export default function CompressHighRatioPage() {
  return (
    <LocalOrPaidGate featureKey="COMPRESS_HIGH_RATIO">
      <CompressHighRatioPdf />
    </LocalOrPaidGate>
  );
}
