'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import type { Segment } from '@/lib/authApi';
import { isTauri } from '@/lib/platform';
import GoogleSignInButton from './GoogleSignInButton';

const SEGMENTS: { value: Segment; label: string; description: string }[] = [
  { value: 'LAWYER', label: 'Lawyer', description: 'Contracts, redlines, clause review' },
  { value: 'ACCOUNTANT', label: 'Accountant', description: 'Invoices, statements, exports' },
  { value: 'RESEARCHER', label: 'Researcher', description: 'Papers, citations, chat' },
];

const ICONS: Record<Segment, JSX.Element> = {
  LAWYER: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M12 3v18M5 8l-3 6a3 3 0 0 0 6 0l-3-6ZM19 8l-3 6a3 3 0 0 0 6 0l-3-6ZM5 8h14M9 21h6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  ACCOUNTANT: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M8 6h8M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" strokeLinecap="round" />
    </svg>
  ),
  RESEARCHER: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="10" cy="10" r="6" />
      <path d="M21 21l-5.2-5.2" strokeLinecap="round" />
    </svg>
  ),
};

export default function SignupForm() {
  const { signup } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [segment, setSegment] = useState<Segment | null>(null);
  const [consented, setConsented] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleStep1Submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setStep(2);
  }

  async function handleFinish() {
    if (!segment) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await signup(email.trim(), password, name.trim() || undefined, segment);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create an account.');
      setStep(1);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (step === 2) {
    return (
      <div className="mx-auto mt-10 w-full max-w-2xl px-6">
        <div className="rounded-xl border border-gray-200 bg-white p-10 shadow-sm">
          <h1 className="text-center font-serif text-2xl font-semibold text-navy">
            What&apos;s your field?
          </h1>
          <p className="mt-2 text-center text-sm text-ink-soft">
            This shapes your workspace — choose carefully, this can&apos;t be changed later.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {SEGMENTS.map((s) => {
              const selected = segment === s.value;
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setSegment(s.value)}
                  className={`relative rounded-xl border-2 p-6 text-left transition-colors ${
                    selected ? 'border-emerald' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {selected && (
                    <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-emerald text-[11px] text-white">
                      ✓
                    </span>
                  )}
                  <span className="mb-4 flex h-9 w-9 items-center justify-center text-navy">
                    {ICONS[s.value]}
                  </span>
                  <p className="font-serif text-lg font-semibold text-navy">{s.label}</p>
                  <p className="mt-1 text-xs text-ink-soft">{s.description}</p>
                </button>
              );
            })}
          </div>

          {error && <p className="mt-6 text-center text-sm text-redline">{error}</p>}

          <label className="mt-6 flex items-start gap-2.5 text-sm text-ink-soft">
            <input
              type="checkbox"
              checked={consented}
              onChange={(e) => setConsented(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-emerald focus:ring-emerald"
            />
            <span>
              I agree to the{' '}
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="font-medium text-navy hover:text-emerald">
                Privacy Policy
              </a>{' '}
              and{' '}
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="font-medium text-navy hover:text-emerald">
                Terms of Service
              </a>
            </span>
          </label>

          <button
            onClick={handleFinish}
            disabled={!segment || !consented || isSubmitting}
            className="mt-4 w-full rounded-lg bg-emerald px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isSubmitting ? 'Creating account…' : 'Continue to Dashboard'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-10 w-full max-w-sm px-6">
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="font-serif text-2xl font-semibold text-navy">Create your account</h1>
        <p className="mt-2 text-sm text-ink-soft">Free to start — no credit card required.</p>

        {!isTauri() && (
          <>
            <div className="mt-6">
              <GoogleSignInButton label="Continue with Google" />
            </div>
            <div className="my-5 flex items-center gap-3 text-xs text-ink-soft">
              <span className="h-px flex-1 bg-gray-200" />
              or
              <span className="h-px flex-1 bg-gray-200" />
            </div>
          </>
        )}

        <form onSubmit={handleStep1Submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-ink-soft">At least 8 characters.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink">Name (optional)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          {error && <p className="text-sm text-redline">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-lg bg-emerald px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-dark"
          >
            Continue
          </button>
        </form>

        <p className="mt-4 text-sm text-ink-soft">
          Already have an account?{' '}
          <a href="/login" className="font-medium text-navy hover:text-emerald">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
