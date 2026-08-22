'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import { useAuth } from '@/lib/AuthContext';
import { useLocale } from '@/lib/i18n/LocaleContext';
import { getPricingContent } from '@/lib/i18n/pricingContent';
import { isTauri } from '@/lib/platform';
import { CheckIcon } from '@/lib/icons';
import {
  fetchPlans,
  startCheckout,
  fetchPublicFeatures,
  formatCents,
  type BillingCycle,
  type SegmentPricing,
  type PublicFeature,
} from '@/lib/billingApi';
import type { DictionaryKey } from '@/lib/i18n/dictionaries/en';

// Feature.label is a plain English string in the database (admin-authored,
// see the Feature seed migrations) with no i18n of its own — every one of
// these keys already has a translated label somewhere else in the app
// (a standalone tool page's catalog entry, or — for the four workspace-only
// operations with no tool page of their own — the Activity log's operation
// labels), so this maps each Feature.key straight to that existing key
// rather than inventing a third, redundant set of translations.
const FEATURE_LABEL_KEY: Record<string, DictionaryKey> = {
  PROTECT_PDF: 'tool.protect.name',
  WORD_TO_PDF: 'tool.wordToPdf.name',
  COMPRESS_HIGH_RATIO: 'tool.compressHighRatio.name',
  REMOVE_PASSWORD: 'tool.removePassword.name',
  PDF_TO_WORD: 'tool.pdfToWord.name',
  EXCEL_TO_PDF: 'tool.excelToPdf.name',
  PDF_TO_EXCEL: 'tool.pdfToExcel.name',
  POWERPOINT_TO_PDF: 'tool.powerpointToPdf.name',
  PDF_TO_POWERPOINT: 'tool.pdfToPowerpoint.name',
  PDF_TO_HTML: 'tool.pdfToHtml.name',
  SUMMARIZE: 'settings.opSummarize',
  ANALYZE_CLAUSES: 'settings.opAnalyzeClauses',
  CHAT: 'settings.opChat',
  COMPARE_CONTRACTS: 'tool.contractCompare.name',
  SUMMARIZE_PLAIN: 'tool.plainSummary.name',
  AUDIT_NDA: 'tool.ndaAudit.name',
  DETECT_SENSITIVE_DATA: 'tool.redactionDetector.name',
  EXTRACT_INVOICE: 'tool.batchInvoiceExport.name',
  ANALYZE_FINANCIAL_RATIOS: 'tool.financialRatios.name',
  RECONCILE_BANK: 'tool.bankReconciliation.name',
  FLAG_DEDUCTIBLE_EXPENSES: 'tool.taxDeductible.name',
  DETECT_DUPLICATE_PAYMENTS: 'tool.duplicatePayments.name',
  EXTRACT_REFERENCES: 'settings.opExtractReferences',
  COMPARE_PAPERS: 'tool.multiPaperCompare.name',
  EXTRACT_METHODOLOGY: 'tool.methodologyExtractor.name',
  GENERATE_OUTLINE: 'tool.presentationOutline.name',
};

function featureLabel(f: PublicFeature, t: (key: DictionaryKey) => string): string {
  const key = FEATURE_LABEL_KEY[f.key];
  return key ? t(key) : f.label;
}
import {
  creditsEnabled,
  listCreditPacks,
  startCreditCheckout,
  formatCents as formatCreditCents,
  type CreditPack,
} from '@/lib/creditsApi';
import { showError } from '@/lib/toast';

type Segment = 'LAWYER' | 'ACCOUNTANT' | 'RESEARCHER';
type TabValue = Segment | 'CREDITS';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface CmsSections {
  intro?: { heading: string };
  faq?: { items: { q: string; a: string }[] };
}

async function fetchCmsSections(preview: boolean, locale?: string): Promise<CmsSections> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const params = new URLSearchParams();
    if (preview) params.set('preview', '1');
    if (locale && locale !== 'en') params.set('locale', locale);
    const qs = params.toString();
    const res = await fetch(`${API_URL}/cms/pages/pricing${qs ? `?${qs}` : ''}`, {
      signal: controller.signal,
      cache: preview ? 'no-store' : 'no-cache',
    });
    clearTimeout(timeout);
    if (!res.ok) return {};
    const data = await res.json();
    return (data.sections ?? {}) as CmsSections;
  } catch {
    return {};
  }
}

function PricingPageInner() {
  const { user, token } = useAuth();
  const { locale, t } = useLocale();
  const pc = getPricingContent(locale);
  const PLAN_COPY: Record<Segment, { tab: string; name: string }> = {
    LAWYER: { tab: pc.planTabs.legal, name: pc.planNames.legal },
    ACCOUNTANT: { tab: pc.planTabs.accounting, name: pc.planNames.accounting },
    RESEARCHER: { tab: pc.planTabs.research, name: pc.planNames.research },
  };
  const CORE_TOOLS_LINE = pc.coreToolsLine;
  const CYCLES: { value: BillingCycle; label: string }[] = [
    { value: 'WEEKLY', label: pc.cycleLabels.weekly },
    { value: 'MONTHLY', label: pc.cycleLabels.monthly },
    { value: 'QUARTERLY', label: pc.cycleLabels.quarterly },
    { value: 'YEARLY', label: pc.cycleLabels.yearly },
  ];
  const CYCLE_PERIOD: Record<BillingCycle, string> = {
    WEEKLY: pc.cyclePeriod.weekly,
    MONTHLY: pc.cyclePeriod.monthly,
    QUARTERLY: pc.cyclePeriod.quarterly,
    YEARLY: pc.cyclePeriod.yearly,
  };
  const DEFAULT_HEADING = pc.heading;
  const DEFAULT_FAQS = pc.faqs;
  const searchParams = useSearchParams();
  const preview = searchParams.get('cmsPreview') === '1';
  const [tab, setTab] = useState<TabValue>('LAWYER');
  const [cycle, setCycle] = useState<BillingCycle>('MONTHLY');
  const [pricing, setPricing] = useState<SegmentPricing[] | null>(null);
  const [billingConfigured, setBillingConfigured] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const [showCreditsTab, setShowCreditsTab] = useState(false);
  const [packs, setPacks] = useState<CreditPack[] | null>(null);
  const [buyingPackId, setBuyingPackId] = useState<string | null>(null);
  const [features, setFeatures] = useState<PublicFeature[]>([]);
  const [cms, setCms] = useState<CmsSections>({});
  const [compareOpen, setCompareOpen] = useState(false);

  useEffect(() => {
    fetchPlans()
      .then((res) => {
        setPricing(res.plans);
        setBillingConfigured(res.configured);
      })
      .catch(() => {});
    creditsEnabled()
      .then(setShowCreditsTab)
      .catch(() => setShowCreditsTab(false));
    listCreditPacks()
      .then(setPacks)
      .catch(() => setPacks([]));
    fetchPublicFeatures()
      .then(setFeatures)
      .catch(() => setFeatures([]));
    fetchCmsSections(preview, locale).then(setCms);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preview, locale]);

  const heading = cms.intro?.heading ?? DEFAULT_HEADING;
  const faqs = cms.faq?.items ?? DEFAULT_FAQS;

  const segment = tab === 'CREDITS' ? null : tab;
  const current = segment ? PLAN_COPY[segment] : null;
  const cyclesForSegment = pricing?.find((p) => p.segment === segment)?.cycles;
  const selectedPrice = cyclesForSegment?.find((c) => c.cycle === cycle);
  // Free card lists exactly what's toggled on for this segment; the paid
  // card lists everything, since a PAID user always unlocks every feature
  // regardless of the (currently unused) proEnabled flag.
  const segmentFeatures = segment ? features.filter((f) => f.segment === segment).sort((a, b) => a.order - b.order) : [];
  const freeFeatures = segmentFeatures.filter((f) => f.freeEnabled);

  async function handleSubscribe() {
    if (!token) return;
    setIsCheckingOut(true);
    setCheckoutError(null);
    try {
      const url = await startCheckout(token, cycle);
      window.location.href = url;
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : pc.couldNotStartCheckout);
    } finally {
      setIsCheckingOut(false);
    }
  }

  async function handleBuyCredits(packId: string) {
    if (!token) return;
    setBuyingPackId(packId);
    try {
      const url = await startCreditCheckout(token, packId);
      window.location.href = url;
    } catch (err) {
      showError(err instanceof Error ? err.message : pc.couldNotStartCheckout);
    } finally {
      setBuyingPackId(null);
    }
  }

  const desktop = isTauri();

  return (
    <div className={desktop ? 'px-9 py-7' : 'bg-surface px-6 py-20 sm:px-12'}>
      <div className={desktop ? '' : `mx-auto text-center ${tab === 'CREDITS' ? 'max-w-2xl' : 'max-w-3xl'}`}>
        {desktop ? (
          <div className="mb-6">
            <h1 className="font-serif text-2xl font-medium text-navy">{pc.desktopTitle}</h1>
            <p className="mt-1.5 text-xs text-ink-soft">{pc.desktopSubtitle}</p>
          </div>
        ) : (
          <h1 className="font-serif text-3xl font-medium text-navy sm:text-4xl">{heading}</h1>
        )}

        <div className={`relative flex gap-1 ${desktop ? '' : 'mt-10 justify-center'}`}>
          {(Object.keys(PLAN_COPY) as Segment[]).map((key) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`rounded-t-lg ${desktop ? 'px-4 pb-2 pt-2' : 'px-5 pb-3 pt-2.5'} font-mono text-xs uppercase tracking-wide transition-all ${
                tab === key
                  ? 'bg-paper font-semibold text-navy shadow-[0_-2px_8px_rgba(0,0,0,0.06)]'
                  : 'bg-[#E9E2CE] text-[#6B6250] opacity-70 hover:opacity-90'
              }`}
            >
              {PLAN_COPY[key].tab}
            </button>
          ))}
          {showCreditsTab && (
            <button
              onClick={() => setTab('CREDITS')}
              className={`rounded-t-lg ${desktop ? 'px-4 pb-2 pt-2' : 'px-5 pb-3 pt-2.5'} font-mono text-xs uppercase tracking-wide transition-all ${
                tab === 'CREDITS'
                  ? 'bg-paper font-semibold text-navy shadow-[0_-2px_8px_rgba(0,0,0,0.06)]'
                  : 'bg-[#E9E2CE] text-[#6B6250] opacity-70 hover:opacity-90'
              }`}
            >
              {pc.planTabs.credits}
            </button>
          )}
        </div>

        {tab !== 'CREDITS' && (
          <div className={desktop ? 'mb-3' : 'mb-1 mt-3'}>
            <button onClick={() => setCompareOpen(true)} className="text-[13px] text-emerald hover:underline">
              {pc.comparePlans}
            </button>
          </div>
        )}

        {tab === 'CREDITS' ? (
          <div className={`rounded-b-xl rounded-se-xl border border-paper-line bg-white text-start shadow-sm ${desktop ? 'p-6' : 'p-10'}`}>
            <h2 className="font-serif text-xl font-semibold text-navy">{pc.planTabs.credits}</h2>
            <p className="mt-1 text-sm text-ink-soft">
              {pc.payAsYouGoDescription}
            </p>

            {!packs ? (
              <p className="mt-8 text-sm text-ink-soft">{pc.loading}</p>
            ) : (
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {packs.map((pack) => (
                  <div
                    key={pack.id}
                    className={`relative rounded-xl border p-6 ${
                      pack.isBestValue ? 'border-emerald' : 'border-gray-200'
                    }`}
                  >
                    {pack.isBestValue && (
                      <span className="absolute -top-3 end-4 rounded-full bg-emerald-soft px-2.5 py-1 font-mono text-[10px] font-semibold text-emerald">
                        {pc.bestValue}
                      </span>
                    )}
                    <p className="font-serif text-lg text-navy">{pack.size} credits</p>
                    <p className="mt-2 font-serif text-3xl font-medium text-navy">
                      {formatCreditCents(pack.priceCents)}
                    </p>
                    <p className="mt-1 font-mono text-xs text-ink-soft">
                      ~{formatCreditCents(Math.round(pack.priceCents / pack.size))}/credit
                    </p>
                    {user ? (
                      <button
                        onClick={() => handleBuyCredits(pack.id)}
                        disabled={buyingPackId !== null}
                        className="mt-5 block w-full rounded-lg bg-emerald px-6 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
                      >
                        {buyingPackId === pack.id ? pc.startingCheckout : pc.buyCredits}
                      </button>
                    ) : (
                      <Link
                        href="/signup"
                        className="mt-5 block w-full rounded-lg bg-emerald px-6 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-emerald-dark"
                      >
                        {pc.signUpToBuy}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}

            <p className="mt-6 text-[13px] text-ink-soft">
              {pc.creditsNeverExpire}
            </p>
            {!billingConfigured && (
              <p className="mt-3 text-center text-xs text-ink-soft">
                {pc.billingNotLive}
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Free plan — sits alongside the paid plan, not hidden behind a separate tab.
                Its feature list is exactly the segment's freeEnabled features, live from
                the admin panel's "Features per plan" toggles. */}
            <div className={`rounded-b-xl rounded-se-xl border border-paper-line bg-white text-start shadow-sm sm:rounded-ss-xl ${desktop ? 'p-6' : 'p-10'}`}>
              <h2 className="font-serif text-xl font-semibold text-navy">{pc.free}</h2>
              <p className="mt-6">
                <span className="font-serif text-4xl font-medium text-navy">$0</span>
                <span className="ms-1 text-sm text-ink-soft">{pc.forever}</span>
              </p>

              <ul className="mt-6 space-y-2.5 text-sm text-ink-soft">
                <li className="flex items-center gap-2">
                  <span className="text-[8px] text-emerald">●</span>
                  {CORE_TOOLS_LINE}
                </li>
                {freeFeatures.map((f) => (
                  <li key={f.key} className="flex items-center gap-2">
                    <span className="text-[8px] text-emerald">●</span>
                    {featureLabel(f, t)}
                  </li>
                ))}
              </ul>

              {user ? (
                <p className="mt-8 rounded-lg border border-gray-200 px-6 py-3 text-center text-sm text-ink-soft">
                  {user.plan === 'FREE' ? pc.yourCurrentPlan : pc.includedWithEveryPlan}
                </p>
              ) : (
                <Link
                  href="/signup"
                  className="mt-8 block w-full rounded-lg border border-navy px-6 py-3 text-center font-medium text-navy transition-colors hover:bg-navy hover:text-white"
                >
                  {pc.startFree}
                </Link>
              )}
            </div>

            <div className={`rounded-xl border border-paper-line bg-white text-start shadow-sm ${desktop ? 'p-6' : 'p-10'}`}>
              <h2 className="font-serif text-xl font-semibold text-navy">{current?.name}</h2>

              <div className="mt-6 grid grid-cols-4 gap-1">
                {CYCLES.map((c) => {
                  const active = cycle === c.value;
                  return (
                    <button
                      key={c.value}
                      onClick={() => setCycle(c.value)}
                      className={`relative rounded-md border px-2 py-2.5 text-center text-xs font-medium transition-colors ${
                        active ? 'border-emerald bg-emerald text-white' : 'border-gray-200 text-ink-soft hover:border-gray-300'
                      }`}
                    >
                      {(c.value === 'QUARTERLY' || c.value === 'YEARLY') && (
                        <span
                          className="absolute -top-2 -end-2 rounded px-1 py-0.5 font-mono text-[9px] font-semibold"
                          style={{ background: '#D4A054', color: '#3D2806' }}
                        >
                          {c.value === 'QUARTERLY' ? pc.saveQuarterly : pc.saveYearly}
                        </span>
                      )}
                      {c.label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6">
                {selectedPrice ? (
                  <p>
                    <span className="font-serif text-4xl font-medium text-navy">{formatCents(selectedPrice.priceCents)}</span>
                    <span className="ms-1 text-sm text-ink-soft">{CYCLE_PERIOD[cycle]}</span>
                  </p>
                ) : (
                  <span className="inline-block rounded-full border border-[#E4E8ED] bg-surface px-3 py-1.5 font-mono text-[11px] text-ink-soft">
                    {pc.billingSetupInProgress}
                  </span>
                )}
              </div>

              <ul className="mt-6 space-y-2.5 text-sm text-ink-soft">
                <li className="flex items-center gap-2">
                  <span className="text-[8px] text-emerald">●</span>
                  {pc.everythingInFreePlus}
                </li>
                {segmentFeatures.map((f) => (
                  <li key={f.key} className="flex items-center gap-2">
                    <span className="text-[8px] text-emerald">●</span>
                    {featureLabel(f, t)}
                  </li>
                ))}
              </ul>

              {user ? (
                <>
                  <button
                    onClick={handleSubscribe}
                    disabled={isCheckingOut}
                    className="mt-8 block w-full rounded-lg bg-emerald px-6 py-3 text-center font-medium text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    {isCheckingOut ? pc.startingCheckout : pc.subscribe}
                  </button>
                  {checkoutError && <p className="mt-3 text-center text-xs text-redline">{checkoutError}</p>}
                </>
              ) : (
                <Link
                  href="/signup"
                  className="mt-8 block w-full rounded-lg bg-emerald px-6 py-3 text-center font-medium text-white transition-colors hover:bg-emerald-dark"
                >
                  {pc.signUp}
                </Link>
              )}
              {!billingConfigured && (
                <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-soft">
                  <InfoIcon />
                  {pc.billingNotLive}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="mt-16 text-start">
          {faqs.map((item, i) => (
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
      </div>

      <ComparePlansModal
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        segment={segment ?? 'LAWYER'}
        pricing={pricing}
        features={features}
        user={user}
        token={token}
      />
    </div>
  );
}

// Workspace is locked at registration — see Settings.tsx — so this compares
// Free vs. Paid *within one workspace* rather than across the three
// segments, with a cycle picker for the paid column's price.
function ComparePlansModal({
  open,
  onClose,
  segment,
  pricing,
  features,
  user,
  token,
}: {
  open: boolean;
  onClose: () => void;
  segment: Segment;
  pricing: SegmentPricing[] | null;
  features: PublicFeature[];
  user: { plan: 'FREE' | 'PAID' } | null;
  token: string | null;
}) {
  const { locale, t } = useLocale();
  const pc = getPricingContent(locale);
  const PLAN_COPY: Record<Segment, { tab: string; name: string }> = {
    LAWYER: { tab: pc.planTabs.legal, name: pc.planNames.legal },
    ACCOUNTANT: { tab: pc.planTabs.accounting, name: pc.planNames.accounting },
    RESEARCHER: { tab: pc.planTabs.research, name: pc.planNames.research },
  };
  const CORE_TOOLS_LINE = pc.coreToolsLine;
  const CYCLES: { value: BillingCycle; label: string }[] = [
    { value: 'WEEKLY', label: pc.cycleLabels.weekly },
    { value: 'MONTHLY', label: pc.cycleLabels.monthly },
    { value: 'QUARTERLY', label: pc.cycleLabels.quarterly },
    { value: 'YEARLY', label: pc.cycleLabels.yearly },
  ];
  const CYCLE_PERIOD: Record<BillingCycle, string> = {
    WEEKLY: pc.cyclePeriod.weekly,
    MONTHLY: pc.cyclePeriod.monthly,
    QUARTERLY: pc.cyclePeriod.quarterly,
    YEARLY: pc.cyclePeriod.yearly,
  };
  const [cycle, setCycle] = useState<BillingCycle>('MONTHLY');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cyclesForSegment = pricing?.find((p) => p.segment === segment)?.cycles;
  const selectedPrice = cyclesForSegment?.find((c) => c.cycle === cycle);
  const segmentFeatures = features.filter((f) => f.segment === segment).sort((a, b) => a.order - b.order);

  async function handleSubscribe() {
    if (!token) return;
    setIsCheckingOut(true);
    setError(null);
    try {
      const url = await startCheckout(token, cycle);
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : pc.couldNotStartCheckout);
    } finally {
      setIsCheckingOut(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="overlay-dim fixed inset-0 z-50" />
        <Dialog.Content className="animate-modal-in fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-7 shadow-level-4">
          <Dialog.Title className="font-serif text-xl font-medium text-navy">
            {pc.comparePlansTitle.replace('{name}', PLAN_COPY[segment].name)}
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-ink-soft">
            {pc.comparePlansDescription}
          </Dialog.Description>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-paper-line p-5">
              <h3 className="font-serif text-base font-semibold text-navy">{pc.free}</h3>
              <p className="mt-2 font-serif text-2xl font-medium text-navy">$0</p>
            </div>
            <div className="rounded-xl border border-emerald p-5">
              <h3 className="font-serif text-base font-semibold text-navy">{pc.paid}</h3>
              <div className="mt-2 grid grid-cols-4 gap-1">
                {CYCLES.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setCycle(c.value)}
                    className={`relative rounded-md border px-1 py-1.5 text-center text-[10px] font-medium transition-colors ${
                      cycle === c.value ? 'border-emerald bg-emerald text-white' : 'border-gray-200 text-ink-soft hover:border-gray-300'
                    }`}
                  >
                    {(c.value === 'QUARTERLY' || c.value === 'YEARLY') && (
                      <span
                        className="absolute -top-2 -end-2 rounded px-1 py-0.5 font-mono text-[9px] font-semibold"
                        style={{ background: '#D4A054', color: '#3D2806' }}
                      >
                        {c.value === 'QUARTERLY' ? pc.saveQuarterly : pc.saveYearly}
                      </span>
                    )}
                    {c.label}
                  </button>
                ))}
              </div>
              <p className="mt-3">
                <span className="font-serif text-2xl font-medium text-navy">
                  {selectedPrice ? formatCents(selectedPrice.priceCents) : '—'}
                </span>
                <span className="ms-1 text-xs text-ink-soft">{CYCLE_PERIOD[cycle]}</span>
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-6 text-[11px] font-medium text-ink-soft">
            <span className="w-10 text-center">{pc.free}</span>
            <span className="w-10 text-center">{pc.paid}</span>
          </div>
          <ul className="mt-1 divide-y divide-gray-100">
            <li className="flex items-center justify-between py-2 text-sm">
              <span className="text-ink">{CORE_TOOLS_LINE}</span>
              <span className="flex items-center gap-6">
                <span className="flex w-10 justify-center text-emerald"><CheckIcon /></span>
                <span className="flex w-10 justify-center text-emerald"><CheckIcon /></span>
              </span>
            </li>
            {segmentFeatures.map((f) => (
              <li key={f.key} className="flex items-center justify-between py-2 text-sm">
                <span className="text-ink">{featureLabel(f, t)}</span>
                <span className="flex items-center gap-6">
                  <span className="flex w-10 justify-center">
                    {f.freeEnabled ? <CheckIcon className="text-emerald" /> : <DashIcon className="text-gray-300" />}
                  </span>
                  <span className="flex w-10 justify-center text-emerald"><CheckIcon /></span>
                </span>
              </li>
            ))}
          </ul>

          {error && <p className="mt-4 text-sm text-redline">{error}</p>}

          <div className="mt-6 flex items-center gap-4">
            {user ? (
              <button
                onClick={handleSubscribe}
                disabled={isCheckingOut}
                className="rounded-lg bg-emerald px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {isCheckingOut ? pc.startingCheckout : pc.subscribe}
              </button>
            ) : (
              <Link
                href="/signup"
                className="rounded-lg bg-emerald px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-dark"
              >
                {pc.signUp}
              </Link>
            )}
            <button onClick={onClose} className="text-sm font-medium text-ink-soft hover:text-ink">
              {pc.close}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DashIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" className={className}>
      <path d="M5 12h14" />
    </svg>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={null}>
      <PricingPageInner />
    </Suspense>
  );
}

function InfoIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </svg>
  );
}
