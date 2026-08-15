'use client';

import { flagDeductibleExpenses } from '@/lib/aiApi';
import SingleDocAiTool from './SingleDocAiTool';

export default function TaxDeductibleFlagger() {
  return (
    <SingleDocAiTool
      title="Tax-Deductible Expense Flagger"
      description="Highlights line items that may qualify as tax-deductible business expenses, based on their category."
      runLabel="Flag Expenses"
      onRun={(pages, token) => flagDeductibleExpenses(pages, token)}
      renderResult={(report) => (
        <>
          {report.items.length === 0 ? (
            <p className="rounded-lg border border-gray-200 bg-white p-5 text-sm text-ink-soft">
              No clearly deductible items found.
            </p>
          ) : (
            <ul className="space-y-3">
              {report.items.map((item, i) => (
                <li key={i} className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-medium text-ink">{item.description}</span>
                    <span className="font-mono text-ink-soft">{item.amount}</span>
                  </div>
                  <p className="mt-1 text-sm text-ink-soft">{item.reason}</p>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs text-gray-400">
            This is a suggestion based on expense category, not formal tax advice. Confirm
            deductibility with a qualified tax professional before filing.
          </p>
        </>
      )}
    />
  );
}
