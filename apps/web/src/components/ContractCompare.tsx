'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { extractPdfText, type PageText } from '@/lib/extractPdfText';
import { compareContracts, type CompareFlag } from '@/lib/aiApi';
import { showError } from '@/lib/toast';
import { useLocale } from '@/lib/i18n/LocaleContext';
import ToolSourceModal from './ToolSourceModal';
import CompareView from './CompareView';

interface Slot {
  file: File | null;
  pages: PageText[] | null;
}

function PickSlot({ label, slot, onPick }: { label: string; slot: Slot; onPick: () => void }) {
  const { t } = useLocale();
  return (
    <button
      onClick={onPick}
      className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-white px-6 py-12 text-center transition-colors hover:border-emerald"
    >
      <span className="text-sm font-medium text-ink">{label}</span>
      <span className="text-xs text-ink-soft">{slot.file ? slot.file.name : t('toolPage.compare.clickToChoosePdf')}</span>
    </button>
  );
}

export default function ContractCompare() {
  const { token } = useAuth();
  const { t } = useLocale();
  const [slotA, setSlotA] = useState<Slot>({ file: null, pages: null });
  const [slotB, setSlotB] = useState<Slot>({ file: null, pages: null });
  const [pickingSlot, setPickingSlot] = useState<'a' | 'b' | null>(null);
  const [flags, setFlags] = useState<CompareFlag[] | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePicked(file: File) {
    const target = pickingSlot;
    setPickingSlot(null);
    if (!target) return;
    try {
      const pages = await extractPdfText(file);
      if (target === 'a') setSlotA({ file, pages });
      else setSlotB({ file, pages });
      setFlags(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('toolPage.compare.couldNotReadPdf');
      setError(message);
      showError(message);
    }
  }

  async function handleCompare() {
    if (!slotA.pages || !slotB.pages) return;
    setIsComparing(true);
    setError(null);
    try {
      const result = await compareContracts(slotA.pages, slotB.pages, token ?? undefined, 'Contract');
      setFlags(result.flags);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('toolPage.contractCompare.couldNotCompare');
      setError(message);
      showError(message);
    } finally {
      setIsComparing(false);
    }
  }

  const joinedA = slotA.pages?.map((p) => p.text).join('\n\n') ?? '';
  const joinedB = slotB.pages?.map((p) => p.text).join('\n\n') ?? '';

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-serif text-2xl font-semibold text-navy">{t('tool.contractCompare.name')}</h1>
      <p className="mt-2 text-ink-soft">
        {t('toolPage.contractCompare.description')}
      </p>

      {!flags ? (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <PickSlot label={t('toolPage.contractCompare.oldVersion')} slot={slotA} onPick={() => setPickingSlot('a')} />
            <PickSlot label={t('toolPage.contractCompare.newVersion')} slot={slotB} onPick={() => setPickingSlot('b')} />
          </div>

          {error && <p className="mt-4 text-sm text-redline">{error}</p>}

          <button
            onClick={handleCompare}
            disabled={!slotA.pages || !slotB.pages || isComparing}
            className="mt-6 w-full rounded-lg bg-emerald px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isComparing ? t('toolPage.contractCompare.comparing') : t('toolPage.contractCompare.compareVersions')}
          </button>
        </>
      ) : (
        <div className="mt-6">
          <CompareView
            leftLabel={t('toolPage.contractCompare.oldVersionLabel').replace('{name}', slotA.file?.name ?? '')}
            rightLabel={t('toolPage.contractCompare.newVersionLabel').replace('{name}', slotB.file?.name ?? '')}
            leftText={joinedA}
            rightText={joinedB}
            flags={flags}
            reportTitle={t('toolPage.contractCompare.reportTitle')}
            reportFilename="contract-comparison"
          />
          <button
            onClick={() => {
              setFlags(null);
              setSlotA({ file: null, pages: null });
              setSlotB({ file: null, pages: null });
            }}
            className="mt-6 text-sm font-medium text-navy hover:text-emerald"
          >
            {t('toolPage.contractCompare.compareDifferentFiles')}
          </button>
        </div>
      )}

      <ToolSourceModal open={pickingSlot !== null} onClose={() => setPickingSlot(null)} onPick={handlePicked} />
    </div>
  );
}
