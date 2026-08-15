'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { extractPdfText, type PageText } from '@/lib/extractPdfText';
import { compareContracts, type CompareFlag } from '@/lib/aiApi';
import { showError } from '@/lib/toast';
import ToolSourceModal from './ToolSourceModal';
import CompareView from './CompareView';

interface Slot {
  file: File | null;
  pages: PageText[] | null;
}

function PickSlot({ label, slot, onPick }: { label: string; slot: Slot; onPick: () => void }) {
  return (
    <button
      onClick={onPick}
      className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-white px-6 py-12 text-center transition-colors hover:border-emerald"
    >
      <span className="text-sm font-medium text-ink">{label}</span>
      <span className="text-xs text-ink-soft">{slot.file ? slot.file.name : 'Click to choose a PDF'}</span>
    </button>
  );
}

export default function ContractCompare() {
  const { token } = useAuth();
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
      const message = err instanceof Error ? err.message : 'Could not read this PDF.';
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
      const message = err instanceof Error ? err.message : 'Could not compare these contracts.';
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
      <h1 className="font-serif text-2xl font-semibold text-navy">Contract Compare</h1>
      <p className="mt-2 text-ink-soft">
        Upload two versions of the same contract to see exactly what changed, with AI-flagged risk on
        the changes that matter.
      </p>

      {!flags ? (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <PickSlot label="Old version" slot={slotA} onPick={() => setPickingSlot('a')} />
            <PickSlot label="New version" slot={slotB} onPick={() => setPickingSlot('b')} />
          </div>

          {error && <p className="mt-4 text-sm text-redline">{error}</p>}

          <button
            onClick={handleCompare}
            disabled={!slotA.pages || !slotB.pages || isComparing}
            className="mt-6 w-full rounded-lg bg-emerald px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isComparing ? 'Comparing…' : 'Compare Versions'}
          </button>
        </>
      ) : (
        <div className="mt-6">
          <CompareView
            leftLabel={`Old version — ${slotA.file?.name}`}
            rightLabel={`New version — ${slotB.file?.name}`}
            leftText={joinedA}
            rightText={joinedB}
            flags={flags}
            reportTitle="Contract Comparison Report"
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
            ← Compare different files
          </button>
        </div>
      )}

      <ToolSourceModal open={pickingSlot !== null} onClose={() => setPickingSlot(null)} onPick={handlePicked} />
    </div>
  );
}
