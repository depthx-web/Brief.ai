'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { extractPdfText, type PageText } from '@/lib/extractPdfText';
import { reconcileBank, type ReconciliationReport } from '@/lib/aiApi';
import { showError } from '@/lib/toast';
import ToolSourceModal from './ToolSourceModal';

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

export default function BankReconciliation() {
  const { token } = useAuth();
  const [bankSlot, setBankSlot] = useState<Slot>({ file: null, pages: null });
  const [recordsSlot, setRecordsSlot] = useState<Slot>({ file: null, pages: null });
  const [picking, setPicking] = useState<'bank' | 'records' | null>(null);
  const [report, setReport] = useState<ReconciliationReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePicked(file: File) {
    const target = picking;
    setPicking(null);
    if (!target) return;
    try {
      const pages = await extractPdfText(file);
      if (target === 'bank') setBankSlot({ file, pages });
      else setRecordsSlot({ file, pages });
      setReport(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not read this PDF.';
      setError(message);
      showError(message);
    }
  }

  async function handleReconcile() {
    if (!bankSlot.pages || !recordsSlot.pages) return;
    setIsRunning(true);
    setError(null);
    try {
      setReport(await reconcileBank(bankSlot.pages, recordsSlot.pages, token ?? undefined));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not reconcile these records.';
      setError(message);
      showError(message);
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-serif text-2xl font-semibold text-navy">Bank Reconciliation Assistant</h1>
      <p className="mt-2 text-ink-soft">
        Compares a bank transaction list against recorded invoices and flags unmatched discrepancies.
      </p>

      {!report ? (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <PickSlot label="Bank statement" slot={bankSlot} onPick={() => setPicking('bank')} />
            <PickSlot label="Recorded invoices" slot={recordsSlot} onPick={() => setPicking('records')} />
          </div>

          {error && <p className="mt-4 text-sm text-redline">{error}</p>}

          <button
            onClick={handleReconcile}
            disabled={!bankSlot.pages || !recordsSlot.pages || isRunning}
            className="mt-6 w-full rounded-lg bg-emerald px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isRunning ? 'Reconciling…' : 'Reconcile'}
          </button>
        </>
      ) : (
        <div className="mt-6">
          <p className="rounded-lg border border-emerald/30 bg-emerald-soft px-4 py-3 text-sm text-emerald-dark">
            {report.matchedCount} transaction{report.matchedCount === 1 ? '' : 's'} matched.
          </p>

          {report.discrepancies.length === 0 ? (
            <p className="mt-4 text-sm text-ink-soft">No discrepancies found.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {report.discrepancies.map((d, i) => (
                <li key={i} className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-800">
                    {d.side === 'bank' ? 'On bank statement only' : 'In records only'}
                  </span>
                  <div className="mt-2 flex items-baseline justify-between gap-2 text-sm">
                    <span className="text-ink">{d.description}</span>
                    <span className="font-mono text-ink-soft">{d.amount}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <button
            onClick={() => {
              setReport(null);
              setBankSlot({ file: null, pages: null });
              setRecordsSlot({ file: null, pages: null });
            }}
            className="mt-6 text-sm font-medium text-navy hover:text-emerald"
          >
            ← Reconcile different files
          </button>
        </div>
      )}

      <ToolSourceModal open={picking !== null} onClose={() => setPicking(null)} onPick={handlePicked} />
    </div>
  );
}
