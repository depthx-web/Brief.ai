const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface CreditPack {
  id: string;
  size: number;
  priceCents: number;
  isBestValue: boolean;
  order: number;
  lemonSqueezyVariantId: string | null;
}

export interface CreditTransaction {
  id: string;
  delta: number;
  reason: 'PURCHASE' | 'AI_USAGE' | 'MANUAL_ADMIN_ADJUSTMENT';
  adminNote: string | null;
  createdAt: string;
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

export async function creditsEnabled(): Promise<boolean> {
  const response = await fetch(`${API_URL}/credits/enabled`);
  const { enabled } = await handleResponse<{ enabled: boolean }>(response);
  return enabled;
}

export async function listCreditPacks(): Promise<CreditPack[]> {
  const response = await fetch(`${API_URL}/credits/packs`);
  return handleResponse<CreditPack[]>(response);
}

export async function getCreditBalance(token: string): Promise<number> {
  const response = await fetch(`${API_URL}/credits/balance`, { headers: { Authorization: `Bearer ${token}` } });
  const { balance } = await handleResponse<{ balance: number }>(response);
  return balance;
}

export async function listCreditTransactions(token: string): Promise<CreditTransaction[]> {
  const response = await fetch(`${API_URL}/credits/transactions`, { headers: { Authorization: `Bearer ${token}` } });
  return handleResponse<CreditTransaction[]>(response);
}

export async function startCreditCheckout(token: string, packId: string): Promise<string> {
  const response = await fetch(`${API_URL}/billing/credit-checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ packId }),
  });
  const { url } = await handleResponse<{ url: string }>(response);
  return url;
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
