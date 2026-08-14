const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export type BillingCycle = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
export type Segment = 'LAWYER' | 'ACCOUNTANT' | 'RESEARCHER';

export interface PlanPrice {
  cycle: BillingCycle;
  priceCents: number;
  discountPercent: number;
}

export interface SegmentPricing {
  segment: Segment;
  monthlyBaseCents: number;
  cycles: PlanPrice[];
}

export interface PricingResponse {
  plans: SegmentPricing[];
  configured: boolean;
}

export async function fetchPlans(): Promise<PricingResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/billing/plans`);
  } catch {
    throw new Error('Could not reach the server.');
  }
  if (!response.ok) throw new Error(`Request failed (${response.status}).`);
  return response.json() as Promise<PricingResponse>;
}

export async function startCheckout(token: string, cycle: BillingCycle): Promise<string> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/billing/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ cycle }),
    });
  } catch {
    throw new Error('Could not reach the server.');
  }
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
  const { url } = (await response.json()) as { url: string };
  return url;
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}
