import type { InvoiceData } from './aiApi';
import { toCsv } from './csv';

export interface ExportableRow {
  filename: string;
  data: InvoiceData;
}

function download(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// QuickBooks Online's CSV bank/expense import maps arbitrary columns, but
// Date/Description/Amount/Category is the field set QBO's own import wizard
// expects to find and offer for mapping. Verify against a real sandbox
// import before relying on this in production — column expectations do
// shift between QBO versions (see Batch 4, Section 5).
export function exportToQuickBooks(rows: ExportableRow[]): string {
  const header = ['Date', 'Description', 'Amount', 'Category'];
  const body = rows.map((r) => [r.data.date, `${r.data.vendor} — ${r.data.invoiceNumber}`.trim(), r.data.total, r.data.category]);
  const filename = 'quickbooks-import.csv';
  const csv = toCsv([header, ...body]);
  download(csv, filename);
  return filename;
}

// Xero's Statement Import CSV template columns, in Xero's documented order.
// Amount is negative for money out (an expense/bill payment), which is what
// every one of these extracted invoices represents. Same caveat as
// QuickBooks above — confirm against a sandbox org before launch.
export function exportToXero(rows: ExportableRow[]): string {
  const header = ['Date', 'Amount', 'Payee', 'Description', 'Reference'];
  const body = rows.map((r) => {
    const amount = r.data.total.replace(/[^0-9.-]/g, '');
    const negative = amount && !amount.startsWith('-') ? `-${amount}` : amount;
    return [r.data.date, negative, r.data.vendor, r.data.category, r.data.invoiceNumber];
  });
  const filename = 'xero-import.csv';
  const csv = toCsv([header, ...body]);
  download(csv, filename);
  return filename;
}
