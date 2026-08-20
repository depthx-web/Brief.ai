const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export type PayoutMethod = 'BANK_TRANSFER' | 'PAYPAL';
export type PayoutStatus = 'UNDER_REVIEW' | 'COMPLETED';

export interface ReferralRow {
  maskedName: string;
  signupDate: string;
  status: 'active' | 'cancelled';
  commissionEarnedCents: number;
  isRenewing: boolean;
}

export interface PayoutRequestRow {
  id: string;
  method: PayoutMethod;
  amountCents: number;
  netAmountCents: number;
  status: PayoutStatus;
  createdAt: string;
  completedAt: string | null;
}

export interface AffiliateMe {
  referralLink: string;
  clicks: number;
  successfulReferrals: number;
  earningsThisMonthCents: number;
  totalEarningsCents: number;
  withdrawableBalanceCents: number;
  referrals: ReferralRow[];
  payouts: PayoutRequestRow[];
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `Request failed (${response.status}).`;
    try {
      const body = await response.json();
      if (typeof body?.message === 'string') message = body.message;
    } catch {
      // not JSON — keep generic message
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export async function fetchAffiliateMe(token: string): Promise<AffiliateMe> {
  const response = await fetch(`${API_URL}/affiliate/me`, { headers: { Authorization: `Bearer ${token}` } });
  return handleResponse<AffiliateMe>(response);
}

export async function requestAffiliatePayout(
  token: string,
  data:
    | { method: 'BANK_TRANSFER'; bankName: string; accountNumber: string; accountHolder: string }
    | { method: 'PAYPAL'; paypalEmail: string }
): Promise<PayoutRequestRow> {
  const response = await fetch(`${API_URL}/affiliate/payout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return handleResponse<PayoutRequestRow>(response);
}

// Fire-and-forget click tracking — never surfaces an error to the visitor.
export async function trackAffiliateClick(code: string): Promise<void> {
  try {
    await fetch(`${API_URL}/affiliate/click/${encodeURIComponent(code)}`, { method: 'POST' });
  } catch {
    // best-effort
  }
}

export { formatCents } from './format';
