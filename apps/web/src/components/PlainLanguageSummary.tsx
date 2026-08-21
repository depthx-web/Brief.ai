'use client';

import { summarizePlain } from '@/lib/aiApi';
import { useLocale } from '@/lib/i18n/LocaleContext';
import SingleDocAiTool from './SingleDocAiTool';

export default function PlainLanguageSummary() {
  const { t } = useLocale();
  return (
    <SingleDocAiTool
      title={t('aiTool.plainSummary.title')}
      description={t('aiTool.plainSummary.description')}
      runLabel={t('aiTool.plainSummary.runLabel')}
      onRun={(pages, token) => summarizePlain(pages, token, 'Contract')}
      renderResult={(summary) => (
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{summary}</p>
        </div>
      )}
    />
  );
}
