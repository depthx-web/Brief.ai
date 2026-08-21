'use client';

import { detectSensitiveData } from '@/lib/aiApi';
import { useLocale } from '@/lib/i18n/LocaleContext';
import SingleDocAiTool from './SingleDocAiTool';

export default function RedactionDetector() {
  const { t } = useLocale();
  return (
    <SingleDocAiTool
      title={t('aiTool.redaction.title')}
      description={t('aiTool.redaction.description')}
      runLabel={t('aiTool.redaction.runLabel')}
      onRun={(pages, token) => detectSensitiveData(pages, token)}
      renderResult={(report) =>
        report.items.length === 0 ? (
          <p className="rounded-lg border border-gray-200 bg-white p-5 text-sm text-ink-soft">
            {t('aiTool.redaction.noneFound')}
          </p>
        ) : (
          <ul className="space-y-3">
            {report.items.map((item, i) => (
              <li key={i} className="rounded-lg border border-redline/40 bg-red-50 p-4">
                <span className="rounded-full bg-redline px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
                  {item.type}
                </span>
                <p className="mt-2 font-mono text-sm text-ink">{item.excerpt}</p>
              </li>
            ))}
          </ul>
        )
      }
    />
  );
}
