'use client';

import { analyzeFinancialRatios } from '@/lib/aiApi';
import { useLocale } from '@/lib/i18n/LocaleContext';
import SingleDocAiTool from './SingleDocAiTool';

export default function FinancialRatioAnalyzer() {
  const { t } = useLocale();
  return (
    <SingleDocAiTool
      title={t('aiTool.financialRatios.title')}
      description={t('aiTool.financialRatios.description')}
      runLabel={t('aiTool.financialRatios.runLabel')}
      onRun={(pages, token) => analyzeFinancialRatios(pages, token)}
      renderResult={(report) =>
        report.ratios.length === 0 ? (
          <p className="rounded-lg border border-gray-200 bg-white p-5 text-sm text-ink-soft">
            {t('aiTool.financialRatios.noneFound')}
          </p>
        ) : (
          <ul className="space-y-3">
            {report.ratios.map((r) => (
              <li key={r.name} className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-medium text-ink">{r.name}</span>
                  <span className="font-mono text-lg text-emerald-dark">{r.value}</span>
                </div>
                <p className="mt-1 text-sm text-ink-soft">{r.explanation}</p>
              </li>
            ))}
          </ul>
        )
      }
    />
  );
}
