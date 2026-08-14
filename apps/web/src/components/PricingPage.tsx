'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { fetchPlans, startCheckout, formatCents, type BillingCycle, type SegmentPricing } from '@/lib/billingApi';

type Segment = 'LAWYER' | 'ACCOUNTANT' | 'RESEARCHER';

const PLAN_COPY: Record<Segment, { tab: string; name: string; features: string[] }> = {
  LAWYER: {
    tab: 'Legal',
    name: 'For Lawyers & Firms',
    features: [
      'Unlimited contract redlines',
      'Clause risk detection with explanations',
      'Automatic entity extraction to CSV',
      'Semantic search across your contract library',
      'Compliance-ready processing log',
    ],
  },
  ACCOUNTANT: {
    tab: 'Accounting',
    name: 'For Accountants & Small Business',
    features: [
      'Batch invoice data extraction',
      'Automatic expense categorization',
      'QuickBooks / Xero-ready CSV export',
      'Editable review before export',
      'Volume pricing for high-invoice months',
    ],
  },
  RESEARCHER: {
    tab: 'Research',
    name: 'For Researchers & Grad Students',
    features: [
      'Chat with any paper, with page citations',
      'BibTeX / APA / MLA reference export',
      'Searchable personal research library',
      'Free tier available with monthly limits',
    ],
  },
};

const CYCLES: { value: BillingCycle; label: string }[] = [
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'YEARLY', label: 'Yearly' },
];

const CYCLE_PERIOD: Record<BillingCycle, string> = {
  WEEKLY: '/week',
  MONTHLY: '/month',
  QUARTERLY: '/quarter',
  YEARLY: '/year',
};

const FAQS = [
  {
    q: 'Is my document content used to train any AI model?',
    a: 'No. Your files and extracted text are sent only to process your request, never used for training.',
  },
  {
    q: 'Can I switch professions/workspace later?',
    a: 'Yes — change it anytime from Settings or the dashboard sidebar. It only affects which workspace view you see, not your saved documents.',
  },
  {
    q: 'What does "processed locally" mean?',
    a: 'Merge, split, rotate, organize, and other core tools run entirely in your browser — the file never leaves your device, and they stay free with no usage cap.',
  },
  {
    q: 'What needs a paid plan?',
    a: 'AI features, OCR, and anything that needs our servers (Office↔PDF conversion, password protect/remove) are part of a paid workspace plan.',
  },
];

export default function PricingPage() {
  const { user, token } = useAuth();
  const [segment, setSegment] = useState<Segment>('LAWYER');
  const [cycle, setCycle] = useState<BillingCycle>('MONTHLY');
  const [pricing, setPricing] = useState<SegmentPricing[] | null>(null);
  const [billingConfigured, setBillingConfigured] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans()
      .then((res) => {
        setPricing(res.plans);
        setBillingConfigured(res.configured);
      })
      .catch(() => {});
  }, []);

  const current = PLAN_COPY[segment];
  const cyclesForSegment = pricing?.find((p) => p.segment === segment)?.cycles;
  const selectedPrice = cyclesForSegment?.find((c) => c.cycle === cycle);

  async function handleSubscribe() {
    if (!token) return;
    setIsCheckingOut(true);
    setCheckoutError(null);
    try {
      const url = await startCheckout(token, cycle);
      window.location.href = url;
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'Could not start checkout.');
    } finally {
      setIsCheckingOut(false);
    }
  }

  return (
    <div className="bg-surface px-6 py-20 sm:px-12">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-serif text-3xl font-medium text-navy sm:text-4xl">
          A plan for every profession
        </h1>

        <div className="relative mt-10 flex justify-center gap-1">
          {(Object.keys(PLAN_COPY) as Segment[]).map((key) => (
            <button
              key={key}
              onClick={() => setSegment(key)}
              className={`rounded-t-lg px-5 pb-3 pt-2.5 font-mono text-xs uppercase tracking-wide transition-all ${
                segment === key
                  ? 'bg-paper font-semibold text-navy shadow-[0_-2px_8px_rgba(0,0,0,0.06)]'
                  : 'bg-[#E9E2CE] text-[#6B6250] opacity-70 hover:opacity-90'
              }`}
            >
              {PLAN_COPY[key].tab}
            </button>
          ))}
        </div>

        <div className="rounded-b-xl rounded-tr-xl border border-paper-line bg-white p-10 text-left shadow-sm">
          <h2 className="font-serif text-xl font-semibold text-navy">{current.name}</h2>

          <div className="mt-6 grid grid-cols-4 gap-2">
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
                    <span className="absolute -top-2 right-1 rounded bg-amber-400 px-1 py-0.5 font-mono text-[9px] font-semibold text-navy">
                      Save {c.value === 'QUARTERLY' ? '10%' : '20%'}
                    </span>
                  )}
                  {c.label}
                </button>
              );
            })}
          </div>

          <p className="mt-6">
            <span className="font-serif text-4xl font-medium text-navy">
              {selectedPrice ? formatCents(selectedPrice.priceCents) : '—'}
            </span>
            <span className="ml-1 text-sm text-ink-soft">{CYCLE_PERIOD[cycle]}</span>
          </p>

          <ul className="mt-6 space-y-2.5 text-sm text-ink-soft">
            {current.features.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="text-[8px] text-emerald">●</span>
                {f}
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
                {isCheckingOut ? 'Starting checkout…' : 'Subscribe'}
              </button>
              {checkoutError && <p className="mt-3 text-center text-xs text-redline">{checkoutError}</p>}
            </>
          ) : (
            <Link
              href="/signup"
              className="mt-8 block w-full rounded-lg bg-emerald px-6 py-3 text-center font-medium text-white transition-colors hover:bg-emerald-dark"
            >
              Start Free
            </Link>
          )}
          {!billingConfigured && (
            <p className="mt-3 text-center text-xs text-ink-soft">
              Billing isn&apos;t live yet — every tool is free to use while we finish it.
            </p>
          )}
        </div>

        <div className="mt-16 text-left">
          {FAQS.map((item, i) => (
            <div key={item.q} className="border-t border-gray-200 py-4">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between text-left"
              >
                <span className="font-medium text-navy">{item.q}</span>
                <span className="text-ink-soft">{openFaq === i ? '−' : '+'}</span>
              </button>
              {openFaq === i && <p className="mt-2 text-sm text-ink-soft">{item.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
