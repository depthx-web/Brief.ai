'use client';

import { detectDuplicatePayments } from '@/lib/aiApi';
import { useLocale } from '@/lib/i18n/LocaleContext';
import SingleDocAiTool from './SingleDocAiTool';

export default function DuplicatePaymentDetector() {
  const { t } = useLocale();
  return (
    <SingleDocAiTool
      title={t('aiTool.duplicatePayments.title')}
      description={t('aiTool.duplicatePayments.description')}
      runLabel={t('aiTool.duplicatePayments.runLabel')}
      onRun={(pages, token) => detectDuplicatePayments(pages, token)}
      renderResult={(report) =>
        report.duplicates.length === 0 ? (
          <p className="rounded-lg border border-gray-200 bg-white p-5 text-sm text-ink-soft">
            {t('aiTool.duplicatePayments.noneFound')}
          </p>
        ) : (
          <ul className="space-y-3">
            {report.duplicates.map((d, i) => (
              <li key={i} className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-medium text-ink">{d.description}</span>
                  <span className="font-mono text-ink-soft">{d.amount}</span>
                </div>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
                  {t('aiTool.duplicatePayments.appears').replace('{n}', String(d.occurrences))}
                </p>
              </li>
            ))}
          </ul>
        )
      }
    />
  );
}
