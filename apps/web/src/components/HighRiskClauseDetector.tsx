'use client';

import { analyzeClauses } from '@/lib/aiApi';
import { useLocale } from '@/lib/i18n/LocaleContext';
import type { DictionaryKey } from '@/lib/i18n/dictionaries/en';
import SingleDocAiTool from './SingleDocAiTool';

const ENTITY_LABEL_KEY: Record<'parties' | 'dates' | 'amounts' | 'obligations', DictionaryKey> = {
  parties: 'aiTool.highRiskClauses.parties',
  dates: 'aiTool.highRiskClauses.dates',
  amounts: 'aiTool.highRiskClauses.amounts',
  obligations: 'aiTool.highRiskClauses.obligations',
};

export default function HighRiskClauseDetector() {
  const { t } = useLocale();
  return (
    <SingleDocAiTool
      title={t('aiTool.highRiskClauses.title')}
      description={t('aiTool.highRiskClauses.description')}
      runLabel={t('aiTool.highRiskClauses.runLabel')}
      onRun={(pages, token) => analyzeClauses(pages, token, 'Contract')}
      renderResult={(analysis) => (
        <div className="space-y-5">
          {analysis.clauses.length > 0 ? (
            <ul className="space-y-3">
              {analysis.clauses.map((c, i) => (
                <li key={i} className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm">
                  <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-800">
                    {c.category}
                  </span>
                  <p className="mt-2 italic text-ink-soft">&ldquo;{c.excerpt}&rdquo;</p>
                  <p className="mt-1 text-ink-soft">{c.explanation}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-soft">{t('aiTool.highRiskClauses.noneFound')}</p>
          )}
          <dl className="space-y-3 text-sm">
            {(['parties', 'dates', 'amounts', 'obligations'] as const).map((key) => (
              <div key={key}>
                <dt className="font-medium text-ink">{t(ENTITY_LABEL_KEY[key])}</dt>
                <dd className="text-ink-soft">{analysis.entities[key].length > 0 ? analysis.entities[key].join(', ') : '—'}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    />
  );
}
