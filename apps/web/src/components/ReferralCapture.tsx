'use client';

import { useEffect } from 'react';
import { trackAffiliateClick } from '@/lib/affiliateApi';

const STORAGE_KEY = 'briefai_referral_code';

// Invisible — records a click on a referral link (?ref=CODE) once per visit
// and remembers the code so signup can attribute the new account to it
// later (Part 9 §4.3), even if the visitor doesn't sign up immediately.
export default function ReferralCapture({ code }: { code: string | undefined }) {
  useEffect(() => {
    if (!code) return;
    localStorage.setItem(STORAGE_KEY, code);
    trackAffiliateClick(code);
  }, [code]);

  return null;
}

export function getStoredReferralCode(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return localStorage.getItem(STORAGE_KEY) ?? undefined;
}
