'use client';

import { useRef, useState } from 'react';
import { extractPdfTextWithOcrFallback } from '@/lib/extractPdfText';
import { extractInvoiceData, type InvoiceData } from '@/lib/aiApi';
import { downloadCsv } from '@/lib/csv';
import { exportToQuickBooks, exportToXero } from '@/lib/invoiceExport';
import { showLoading, resolveLoading } from '@/lib/toast';

interface InvoiceRow {
  id: string;
  filename: string;
  data: InvoiceData | null;
  status: 'processing' | 'done' | 'error';
  error?: string;
}

const CATEGORIES = [
  'Office Supplies',
  'Travel',
  'Software',
  'Utilities',
  'Professional Services',
  'Other',
];

export default function BatchInvoices() {
  const [rows, setRows] = useState<InvoiceRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressLabel, setProgressLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFilesSelected(files: FileList) {
    setError(null);
    const pdfFiles = Array.from(files).filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );
    if (pdfFiles.length === 0) {
      setError('Please select PDF invoices.');
      return;
    }

    const initialRows: InvoiceRow[] = pdfFiles.map((f) => ({
      id: `${f.name}-${f.size}-${crypto.randomUUID()}`,
      filename: f.name,
      data: null,
      status: 'processing',
    }));
    setRows((prev) => [...prev, ...initialRows]);
    setIsProcessing(true);

    for (let i = 0; i < pdfFiles.length; i++) {
      const file = pdfFiles[i];
      const rowId = initialRows[i].id;
      setProgressLabel(`Processing ${i + 1} of ${pdfFiles.length} — ${file.name}`);
      try {
        const { pages } = await extractPdfTextWithOcrFallback(file);
        const data = await extractInvoiceData(pages);
        setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, data, status: 'done' } : r)));
      } catch (err) {
        setRows((prev) =>
          prev.map((r) =>
            r.id === rowId
              ? {
                  ...r,
                  status: 'error',
                  error: err instanceof Error ? err.message : 'Could not extract this invoice.',
                }
              : r
          )
        );
      }
    }

    setProgressLabel(null);
    setIsProcessing(false);
  }

  function updateField(id: string, field: keyof InvoiceData, value: string) {
    setRows((prev) =>
      prev.map((r) => (r.id === id && r.data ? { ...r, data: { ...r.data, [field]: value } } : r))
    );
  }

  function removeRow(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  function doneRows() {
    return rows.filter((r) => r.status === 'done' && r.data) as { filename: string; data: InvoiceData }[];
  }

  function handleExportCsv() {
    const done = doneRows();
    if (done.length === 0) return;
    const toastId = showLoading('Preparing generic export…');
    const header = ['Filename', 'Vendor', 'Invoice Number', 'Date', 'Category', 'Total'];
    const dataRows = done.map((r) => [r.filename, r.data.vendor, r.data.invoiceNumber, r.data.date, r.data.category, r.data.total]);
    downloadCsv([header, ...dataRows], 'invoices.csv');
    resolveLoading(toastId, 'invoices.csv downloaded');
  }

  function handleExportQuickBooks() {
    const done = doneRows();
    if (done.length === 0) return;
    const toastId = showLoading('Preparing QuickBooks export…');
    const filename = exportToQuickBooks(done);
    resolveLoading(toastId, `${filename} downloaded`);
  }

  function handleExportXero() {
    const done = doneRows();
    if (done.length === 0) return;
    const toastId = showLoading('Preparing Xero export…');
    const filename = exportToXero(done);
    resolveLoading(toastId, `${filename} downloaded`);
  }

  const doneCount = rows.filter((r) => r.status === 'done').length;

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-serif text-2xl font-semibold text-navy">Batch Invoice Export</h1>
      <p className="mt-2 text-ink-soft">
        Pull vendor, date, total, and category out of many invoices at once, review, and export
        to CSV.
      </p>
      <p className="mt-1 text-xs text-ink-soft">
        Text is extracted from each PDF in your browser (OCR runs locally too, for scans); only
        that extracted text — not the file — is sent to our AI server.
      </p>

      <div
        onClick={() => inputRef.current?.click()}
        className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white px-6 py-12 text-center"
      >
        <p className="text-ink-soft">Click to choose one or more invoice PDFs</p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFilesSelected(e.target.files)}
        />
      </div>

      {error && <p className="mt-4 text-sm text-redline">{error}</p>}
      {progressLabel && <p className="mt-4 text-sm text-ink-soft">{progressLabel}</p>}

      {rows.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-xs uppercase text-ink-soft">
              <tr>
                <th className="px-3 py-2">File</th>
                <th className="px-3 py-2">Vendor</th>
                <th className="px-3 py-2">Invoice #</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Total</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="max-w-[10rem] truncate px-3 py-2 text-ink-soft">{row.filename}</td>
                  {row.status === 'processing' && (
                    <td colSpan={5} className="px-3 py-2 text-ink-soft">
                      Processing…
                    </td>
                  )}
                  {row.status === 'error' && (
                    <td colSpan={5} className="px-3 py-2 text-redline">
                      {row.error}
                    </td>
                  )}
                  {row.status === 'done' && row.data && (
                    <>
                      <td className="px-3 py-2">
                        <input
                          value={row.data.vendor}
                          onChange={(e) => updateField(row.id, 'vendor', e.target.value)}
                          className="w-32 rounded border border-gray-200 px-2 py-1"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          value={row.data.invoiceNumber}
                          onChange={(e) => updateField(row.id, 'invoiceNumber', e.target.value)}
                          className="w-24 rounded border border-gray-200 px-2 py-1"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          value={row.data.date}
                          onChange={(e) => updateField(row.id, 'date', e.target.value)}
                          className="w-24 rounded border border-gray-200 px-2 py-1"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={row.data.category}
                          onChange={(e) => updateField(row.id, 'category', e.target.value)}
                          className="rounded border border-gray-200 px-2 py-1"
                        >
                          {![...CATEGORIES].includes(row.data.category) && row.data.category && (
                            <option value={row.data.category}>{row.data.category}</option>
                          )}
                          {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          value={row.data.total}
                          onChange={(e) => updateField(row.id, 'total', e.target.value)}
                          className="w-20 rounded border border-gray-200 px-2 py-1"
                        />
                      </td>
                    </>
                  )}
                  <td className="px-3 py-2">
                    <button
                      onClick={() => removeRow(row.id)}
                      className="text-ink-soft hover:text-redline"
                      aria-label={`Remove ${row.filename}`}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <button
          onClick={handleExportQuickBooks}
          disabled={doneCount === 0 || isProcessing}
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-semibold transition-colors hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="rounded bg-[#2CA01C] px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">QB</span>
          Export to QuickBooks
        </button>
        <button
          onClick={handleExportXero}
          disabled={doneCount === 0 || isProcessing}
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-semibold transition-colors hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="rounded bg-[#13B5EA] px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">Xero</span>
          Export to Xero
        </button>
        <button
          onClick={handleExportCsv}
          disabled={doneCount === 0 || isProcessing}
          className="flex items-center justify-center gap-2 rounded-lg bg-emerald px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          Download generic CSV
        </button>
      </div>
    </div>
  );
}
