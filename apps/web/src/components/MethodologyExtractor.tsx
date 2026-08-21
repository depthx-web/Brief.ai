'use client';

import { extractMethodology } from '@/lib/aiApi';
import { useLocale } from '@/lib/i18n/LocaleContext';
import SingleDocAiTool from './SingleDocAiTool';

export default function MethodologyExtractor() {
  const { t } = useLocale();
  return (
    <SingleDocAiTool
      title={t('aiTool.methodology.title')}
      description={t('aiTool.methodology.description')}
      runLabel={t('aiTool.methodology.runLabel')}
      onRun={(pages, token) => extractMethodology(pages, token)}
      renderResult={(m) => (
        <table className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white text-sm">
          <tbody className="divide-y divide-gray-100">
            <tr>
              <th className="w-40 bg-surface px-4 py-3 text-start align-top font-medium text-ink">{t('aiTool.methodology.sample')}</th>
              <td className="px-4 py-3 text-ink-soft">{m.sample}</td>
            </tr>
            <tr>
              <th className="w-40 bg-surface px-4 py-3 text-start align-top font-medium text-ink">{t('aiTool.methodology.tools')}</th>
              <td className="px-4 py-3 text-ink-soft">{m.tools}</td>
            </tr>
            <tr>
              <th className="w-40 bg-surface px-4 py-3 text-start align-top font-medium text-ink">
                {t('aiTool.methodology.statisticalAnalysis')}
              </th>
              <td className="px-4 py-3 text-ink-soft">{m.statisticalAnalysis}</td>
            </tr>
          </tbody>
        </table>
      )}
    />
  );
}
