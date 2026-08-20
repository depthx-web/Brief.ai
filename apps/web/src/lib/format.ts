// Was three separate copies (affiliateApi.ts, creditsApi.ts, billingApi.ts)
// with two different rounding behaviors — plan prices showed "$29" while
// credit-pack prices on the same Pricing page showed "$29.00", purely
// because of which copy got imported. One implementation now, re-exported
// from each of those modules so existing import sites don't need to change.
export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}
