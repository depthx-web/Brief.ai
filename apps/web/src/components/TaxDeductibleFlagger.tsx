'use client';

import { flagDeductibleExpenses } from '@/lib/aiApi';
import { useLocale } from '@/lib/i18n/LocaleContext';
import SingleDocAiTool from './SingleDocAiTool';

export default function TaxDeductibleFlagger() {
  const { t } = useLocale();
  return (
    <SingleDocAiTool
      title={t('aiTool.taxDeductible.title')}
      description={t('aiTool.taxDeductible.description')}
      runLabel={t('aiTool.taxDeductible.runLabel')}
      onRun={(pages, token) => flagDeductibleExpenses(pages, token)}
      renderResult={(report) => (
        <>
          {report.items.length === 0 ? (
            <p className="rounded-lg border border-gray-200 bg-white p-5 text-sm text-ink-soft">
              {t('aiTool.taxDeductible.noneFound')}
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
            {t('aiTool.taxDeductible.disclaimer')}
          </p>
        </>
      )}
    />
  );
}
