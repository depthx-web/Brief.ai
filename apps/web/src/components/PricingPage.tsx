'use client';

import { useState } from 'react';
import Link from 'next/link';

type Plan = 'LAWYER' | 'ACCOUNTANT' | 'RESEARCHER';

const PLANS: Record<
  Plan,
  { tab: string; name: string; price: string; period: string; features: string[] }
> = {
  LAWYER: {
    tab: 'Legal',
    name: 'For Lawyers & Firms',
    price: '$60',
    period: '/user / month',
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
    price: '$20',
    period: '/month + usage',
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
    price: '$7',
    period: '/month',
    features: [
      'Chat with any paper, with page citations',
      'BibTeX / APA / MLA reference export',
      'Searchable personal research library',
      'Free tier available with monthly limits',
    ],
  },
};

const FAQS = [
  {
    q: 'Is my document content used to train any AI model?',
    a: 'No. Your files and extracted text are sent only to process your request, never used for training.',
  },
  {
    q: 'Can I switch professions/workspace later?',
    a: 'Yes — change it anytime from Settings. It only affects which workspace view you see, not your saved documents.',
  },
  {
    q: 'What does "processed locally" mean?',
    a: 'Simple operations (merge, split, rotate, sign, and more) run entirely in your browser — the file never leaves your device.',
  },
  {
    q: 'Is there a free tier?',
    a: 'Every tool works without an account. An account is only needed for the personal library and semantic search.',
  },
];

export default function PricingPage() {
  const [plan, setPlan] = useState<Plan>('LAWYER');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const current = PLANS[plan];

  return (
    <div className="bg-surface px-6 py-20 sm:px-12">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-serif text-3xl font-medium text-navy sm:text-4xl">
          A plan for every profession
        </h1>

        <div className="relative mt-10 flex justify-center gap-1">
          {(Object.keys(PLANS) as Plan[]).map((key) => (
            <button
              key={key}
              onClick={() => setPlan(key)}
              className={`rounded-t-lg px-5 pb-3 pt-2.5 font-mono text-xs uppercase tracking-wide transition-all ${
                plan === key
                  ? 'bg-paper font-semibold text-navy shadow-[0_-2px_8px_rgba(0,0,0,0.06)]'
                  : 'bg-[#E9E2CE] text-[#6B6250] opacity-70 hover:opacity-90'
              }`}
            >
              {PLANS[key].tab}
            </button>
          ))}
        </div>

        <div className="rounded-b-xl rounded-tr-xl border border-paper-line bg-white p-10 text-left shadow-sm">
          <h2 className="font-serif text-xl font-semibold text-navy">{current.name}</h2>
          <p className="mt-4">
            <span className="font-serif text-4xl font-medium text-navy">{current.price}</span>
            <span className="ml-1 text-sm text-ink-soft">{current.period}</span>
          </p>
          <ul className="mt-6 space-y-2.5 text-sm text-ink-soft">
            {current.features.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="text-[8px] text-emerald">●</span>
                {f}
              </li>
            ))}
          </ul>
          <Link
            href="/signup"
            className="mt-8 block w-full rounded-lg bg-emerald px-6 py-3 text-center font-medium text-white transition-colors hover:bg-emerald-dark"
          >
            Start Free
          </Link>
          <p className="mt-3 text-center text-xs text-ink-soft">
            Billing isn&apos;t live yet — every tool is free to use while we finish it.
          </p>
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
