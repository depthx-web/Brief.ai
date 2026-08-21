'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchCmsPage } from '@/lib/cmsApi';
import { useLocale } from '@/lib/i18n/LocaleContext';
import type { DictionaryKey } from '@/lib/i18n/dictionaries/en';
import { detectOs, type Os } from '@/lib/detectOs';
import { getDownloadContent, type DownloadStep, type DownloadFaqItem } from '@/lib/downloadContent';

const OS_NAME_KEY: Record<Os, DictionaryKey> = {
  windows: 'download.osNameWindows',
  mac: 'download.osNameMac',
  linux: 'download.osNameLinux',
  unknown: 'download.osNameUnknown',
};

function localeScreenshotSrc(locale: string): string {
  return locale === 'en' ? '/desktop-app-home.png' : `/desktop-app-home-${locale}.png`;
}

export default function DownloadContent() {
  const { t, locale } = useLocale();
  const preview = useSearchParams().get('cmsPreview') === '1';
  const defaults = getDownloadContent(locale);
  const [os, setOs] = useState<Os>('unknown');
  const [steps, setSteps] = useState<DownloadStep[]>(defaults.steps);
  const [faq, setFaq] = useState<DownloadFaqItem[]>(defaults.faq);
  const [screenshotUrl, setScreenshotUrl] = useState(localeScreenshotSrc(locale));
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    setOs(detectOs());
  }, []);

  useEffect(() => {
    const localizedDefaults = getDownloadContent(locale);
    setScreenshotUrl(localeScreenshotSrc(locale));
    fetchCmsPage('download', preview, locale).then((page) => {
      const instructionsSection = page?.sections.instructions as { items?: DownloadStep[] } | undefined;
      setSteps(instructionsSection?.items?.length ? instructionsSection.items : localizedDefaults.steps);
      const faqSection = page?.sections.faq as { items?: DownloadFaqItem[] } | undefined;
      setFaq(faqSection?.items?.length ? faqSection.items : localizedDefaults.faq);
      const screenshotSection = page?.sections.screenshot as { url?: string } | undefined;
      if (screenshotSection?.url) setScreenshotUrl(screenshotSection.url);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, preview]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-24 sm:px-12">
      <section className="text-center">
        <div className="mb-3.5 font-mono text-xs uppercase tracking-wider text-emerald">{t('download.kicker')}</div>
        <h1 className="mb-5 font-serif text-3xl font-medium leading-tight text-navy sm:text-4xl">
          {t('download.heading').replace('{os}', t(OS_NAME_KEY[os]))}
        </h1>
        <p className="mx-auto mb-8 max-w-md text-base leading-relaxed text-ink-soft">
          {t('download.descriptionPre')}{' '}
          <a href="/tools" className="text-emerald hover:underline">
            {t('download.descriptionLinkText')}
          </a>
          .
        </p>
        <a
          href="mailto:support@brief.ai?subject=Notify%20me%20when%20the%20desktop%20app%20is%20ready"
          className="inline-block rounded-md bg-emerald px-7 py-3.5 text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(30,157,117,0.4)]"
        >
          {t('download.notifyButton')}
        </a>
      </section>

      <section className="mt-16">
        <div
          className="mx-auto w-full max-w-xl overflow-hidden rounded-xl bg-white shadow-level-3"
          style={{ transform: 'rotate(-1deg)' }}
        >
          <div className="grid h-8 grid-cols-[1fr_auto_1fr] items-center bg-surface px-3">
            <div className="flex gap-1.5">
              {os === 'mac' ? (
                <>
                  <span className="h-2.5 w-2.5 rounded-full bg-ink-soft/25" />
                  <span className="h-2.5 w-2.5 rounded-full bg-ink-soft/25" />
                  <span className="h-2.5 w-2.5 rounded-full bg-ink-soft/25" />
                </>
              ) : (
                <svg width="42" height="10" viewBox="0 0 42 10" fill="none" stroke="currentColor" strokeWidth={1.2} className="text-ink-soft/40" aria-hidden>
                  <path d="M1 5h6" />
                  <rect x="17" y="1" width="6" height="6" />
                  <path d="M33 1l6 6M39 1l-6 6" />
                </svg>
              )}
            </div>
            <span className="text-xs text-ink-soft">Dossiera</span>
            <span />
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={screenshotUrl}
            alt={t('download.screenshotAlt')}
            className="block w-full"
            onError={() => setScreenshotUrl('/desktop-app-home.png')}
          />
        </div>
      </section>

      <section className="mt-16">
        <h2 className="font-serif text-xl font-medium text-navy">{t('download.setupHeading')}</h2>
        <ol className="mt-6 space-y-6">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-soft font-mono text-xs font-bold text-emerald">
                {i + 1}
              </span>
              <div>
                <p className="font-medium text-navy">{step.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {faq.length > 0 && (
        <section className="mt-16">
          <h2 className="font-serif text-xl font-medium text-navy">{t('download.faqHeading')}</h2>
          <div className="mt-2">
            {faq.map((item, i) => (
              <div key={item.q} className="border-t border-gray-200 py-4">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between text-start"
                >
                  <span className="font-medium text-navy">{item.q}</span>
                  <span className="text-ink-soft">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && <p className="mt-2 text-sm text-ink-soft">{item.a}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
