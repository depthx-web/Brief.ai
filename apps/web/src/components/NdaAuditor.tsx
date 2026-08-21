'use client';

import { auditNda, type NdaCriterion } from '@/lib/aiApi';
import { useLocale } from '@/lib/i18n/LocaleContext';
import type { DictionaryKey } from '@/lib/i18n/dictionaries/en';
import SingleDocAiTool from './SingleDocAiTool';

const STATUS_STYLE: Record<NdaCriterion['status'], string> = {
  ok: 'bg-emerald-soft text-emerald',
  concern: 'bg-amber-100 text-amber-700',
  missing: 'bg-red-50 text-redline',
};

const STATUS_LABEL_KEY: Record<NdaCriterion['status'], DictionaryKey> = {
  ok: 'aiTool.ndaAudit.statusOk',
  concern: 'aiTool.ndaAudit.statusConcern',
  missing: 'aiTool.ndaAudit.statusMissing',
};

export default function NdaAuditor() {
  const { t } = useLocale();
  return (
    <SingleDocAiTool
      title={t('aiTool.ndaAudit.title')}
      description={t('aiTool.ndaAudit.description')}
      runLabel={t('aiTool.ndaAudit.runLabel')}
      onRun={(pages, token) => auditNda(pages, token)}
      renderResult={(audit) => (
        <ul className="space-y-3">
          {audit.criteria.map((c) => (
            <li key={c.name} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-ink">{c.name}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STATUS_STYLE[c.status]}`}>
                  {t(STATUS_LABEL_KEY[c.status])}
                </span>
              </div>
              <p className="mt-2 text-sm text-ink-soft">{c.detail}</p>
            </li>
          ))}
        </ul>
      )}
    />
  );
}
