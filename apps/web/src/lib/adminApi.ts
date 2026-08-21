const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface CountGroup {
  _count: number;
}

export interface AdminStats {
  users: {
    total: number;
    bySegment: (CountGroup & { segment: string | null })[];
  };
  libraryDocuments: { total: number };
  conversions: {
    byStatus: (CountGroup & { status: string })[];
    byFormat: (CountGroup & { targetFormat: string })[];
  };
  passwordOperations: (CountGroup & { operation: string; status: string })[];
  aiOperations: (CountGroup & { operation: string; status: string })[];
  recentFailures: {
    type: 'conversion' | 'password' | 'ai';
    id: string;
    detail: string;
    errorMessage: string | null;
    createdAt: string;
  }[];
}

async function adminFetch<T>(
  token: string,
  path: string,
  options: { method?: string; query?: Record<string, string | undefined>; body?: unknown } = {}
): Promise<T> {
  const query = options.query
    ? '?' +
      Object.entries(options.query)
        .filter(([, v]) => v)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v as string)}`)
        .join('&')
    : '';

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}${query}`, {
      method: options.method ?? 'GET',
      headers: {
        'x-admin-token': token.trim(),
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    });
  } catch {
    throw new Error('Could not reach the server. Make sure the API (docker compose) is running.');
  }
  if (!response.ok) {
    throw new Error(
      response.status === 401 ? 'Invalid admin token.' : `Request failed (${response.status}).`
    );
  }
  return response.json() as Promise<T>;
}

export async function fetchAdminStats(token: string): Promise<AdminStats> {
  return adminFetch<AdminStats>(token, '/admin/stats');
}

export type AdminSegment = 'LAWYER' | 'ACCOUNTANT' | 'RESEARCHER';
export type AdminPlan = 'FREE' | 'PAID';
export type AdminUserStatus = 'ACTIVE' | 'BANNED';

export interface AdminUserSummary {
  id: string;
  email: string;
  name: string | null;
  segment: AdminSegment | null;
  plan: AdminPlan;
  billingCycle: string | null;
  status: AdminUserStatus;
  createdAt: string;
}

export interface AdminUserListResult {
  users: AdminUserSummary[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AdminUserFilters {
  search?: string;
  segment?: AdminSegment;
  plan?: AdminPlan;
  status?: AdminUserStatus;
  page?: number;
}

export async function fetchAdminUsers(
  token: string,
  filters: AdminUserFilters = {}
): Promise<AdminUserListResult> {
  return adminFetch<AdminUserListResult>(token, '/admin/users', {
    query: {
      search: filters.search,
      segment: filters.segment,
      plan: filters.plan,
      status: filters.status,
      page: filters.page ? String(filters.page) : undefined,
    },
  });
}

export interface AdminUserDetail {
  user: AdminUserSummary & { subscriptionStatus: string | null; currentPeriodEnd: string | null };
  recentUploads: { id: string; filename: string; createdAt: string }[];
  creditBalance: number;
}

export async function fetchAdminUser(token: string, id: string): Promise<AdminUserDetail> {
  return adminFetch<AdminUserDetail>(token, `/admin/users/${id}`);
}

export async function banAdminUser(token: string, id: string): Promise<void> {
  await adminFetch(token, `/admin/users/${id}/ban`, { method: 'POST' });
}

export async function reactivateAdminUser(token: string, id: string): Promise<void> {
  await adminFetch(token, `/admin/users/${id}/reactivate`, { method: 'POST' });
}

export async function resetAdminUserPassword(token: string, id: string): Promise<void> {
  await adminFetch(token, `/admin/users/${id}/reset-password`, { method: 'POST' });
}

export type AdminBillingCycle = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export interface AdminPlanPrice {
  segment: AdminSegment;
  cycle: AdminBillingCycle;
  priceCents: number;
  discountPercent: number;
}

export async function fetchAdminPlanPrices(token: string): Promise<AdminPlanPrice[]> {
  return adminFetch<AdminPlanPrice[]>(token, '/admin/plan-prices');
}

export async function updateAdminPlanPrice(
  token: string,
  segment: AdminSegment,
  cycle: AdminBillingCycle,
  priceCents: number
): Promise<void> {
  await adminFetch(token, `/admin/plan-prices/${segment}/${cycle}`, {
    method: 'PATCH',
    body: { priceCents },
  });
}

export interface AdminFeature {
  id: string;
  // null = a tool available to every workspace (Office<->PDF, Protect,
  // Remove Password), not one profession's AI operation.
  segment: AdminSegment | null;
  key: string;
  label: string;
  freeEnabled: boolean;
  proEnabled: boolean;
  order: number;
}

export async function fetchAdminFeatures(token: string): Promise<AdminFeature[]> {
  return adminFetch<AdminFeature[]>(token, '/admin/features');
}

export async function updateAdminFeature(
  token: string,
  id: string,
  data: { freeEnabled?: boolean; proEnabled?: boolean }
): Promise<void> {
  await adminFetch(token, `/admin/features/${id}`, { method: 'PATCH', body: data });
}

export type AdminDiscountType = 'PERCENT' | 'FIXED';
export type AdminDiscountStatus = 'active' | 'expired' | 'revoked';

export interface AdminDiscountCode {
  id: string;
  code: string;
  type: AdminDiscountType;
  value: number;
  expiresAt: string | null;
  usageLimit: number | null;
  usageCount: number;
  applicableSegments: AdminSegment[];
  revoked: boolean;
  createdAt: string;
  status: AdminDiscountStatus;
}

export interface CreateDiscountCodeInput {
  code: string;
  type: AdminDiscountType;
  value: number;
  expiresAt?: string;
  usageLimit?: number;
  applicableSegments: AdminSegment[];
}

export async function fetchAdminDiscountCodes(token: string): Promise<AdminDiscountCode[]> {
  return adminFetch<AdminDiscountCode[]>(token, '/admin/discount-codes');
}

export async function createAdminDiscountCode(
  token: string,
  input: CreateDiscountCodeInput
): Promise<AdminDiscountCode> {
  return adminFetch<AdminDiscountCode>(token, '/admin/discount-codes', { method: 'POST', body: input });
}

export async function revokeAdminDiscountCode(token: string, id: string): Promise<void> {
  await adminFetch(token, `/admin/discount-codes/${id}/revoke`, { method: 'POST' });
}

export interface AdminProviderStatus {
  name: string;
  envVar: string;
  configured: boolean;
  maskedKey: string | null;
}

export type AdminTaskAlias = 'task-simple' | 'task-complex';

export interface AdminRoutingRule {
  alias: AdminTaskAlias;
  model: string;
  id: string | null;
}

export interface AdminModelChoice {
  model: string;
  label: string;
  envVar: string;
}

export interface AdminAiProvidersResponse {
  providers: AdminProviderStatus[];
  routingRules: AdminRoutingRule[];
  modelChoices: AdminModelChoice[];
  configured: boolean;
}

export async function fetchAdminAiProviders(token: string): Promise<AdminAiProvidersResponse> {
  return adminFetch<AdminAiProvidersResponse>(token, '/admin/ai-providers');
}

export async function updateAdminRoutingRule(
  token: string,
  alias: AdminTaskAlias,
  model: string
): Promise<void> {
  await adminFetch(token, `/admin/ai-providers/routing/${alias}`, { method: 'PATCH', body: { model } });
}

export type AdminEmailCampaignKey =
  | 'WELCOME'
  | 'UPGRADE'
  | 'WINBACK'
  | 'SECURITY'
  | 'RETENTION_WARNING'
  | 'SIGNUP_CONFIRMATION'
  | 'PAYMENT_RECEIPT'
  | 'PLAN_CHANGED'
  | 'CANCELLATION_CONFIRMATION'
  | 'REFERRAL_SUCCESS'
  | 'TEAM_INVITATION';

export interface AdminEmailCampaign {
  id: string;
  key: AdminEmailCampaignKey;
  enabled: boolean;
  subject: string;
  body: string;
}

export async function fetchAdminEmailCampaigns(token: string): Promise<AdminEmailCampaign[]> {
  return adminFetch<AdminEmailCampaign[]>(token, '/admin/email-campaigns');
}

export async function updateAdminEmailCampaign(
  token: string,
  id: string,
  data: { enabled?: boolean; subject?: string; body?: string }
): Promise<void> {
  await adminFetch(token, `/admin/email-campaigns/${id}`, { method: 'PATCH', body: data });
}

// --- Platform settings (credits toggle, affiliate commission/fee rates) ---

export interface AdminPlatformSettings {
  creditsEnabled: boolean;
  paymentsEnabled: boolean;
  commissionSignupPercent: number;
  commissionRenewalPercent: number;
  paypalFeePercent: number;
  paypalFeeFixedCents: number;
  dunningAutoRetryEnabled: boolean;
  dunningMaxAttempts: number;
  dunningIntervalDays: number;
  tokensPerDollar: number;
}

export async function fetchAdminSettings(token: string): Promise<AdminPlatformSettings> {
  return adminFetch<AdminPlatformSettings>(token, '/admin/settings');
}

export async function updateAdminSettings(
  token: string,
  data: Partial<AdminPlatformSettings>
): Promise<void> {
  await adminFetch(token, '/admin/settings', { method: 'PATCH', body: data });
}

// --- Token Economics ----------------------------------------------------

export interface AdminTokenEconomics {
  tokensPerDollar: number;
  todayUsage: number;
  totalCreditsSold: number;
  totalCreditsOutstanding: number;
  providerBalance: number | null;
  providerBalanceAvailable: boolean;
}

export async function fetchTokenEconomics(token: string): Promise<AdminTokenEconomics> {
  return adminFetch<AdminTokenEconomics>(token, '/admin/token-economics');
}

// --- Pay-as-you-go credit packs ---

export interface AdminCreditPack {
  id: string;
  size: number;
  priceCents: number;
  isBestValue: boolean;
  order: number;
  lemonSqueezyVariantId: string | null;
}

export async function fetchAdminCreditPacks(token: string): Promise<AdminCreditPack[]> {
  return adminFetch<AdminCreditPack[]>(token, '/admin/credit-packs');
}

export async function createAdminCreditPack(token: string, size: number, priceCents: number): Promise<void> {
  await adminFetch(token, '/admin/credit-packs', { method: 'POST', body: { size, priceCents } });
}

export async function updateAdminCreditPack(
  token: string,
  id: string,
  data: { size?: number; priceCents?: number }
): Promise<void> {
  await adminFetch(token, `/admin/credit-packs/${id}`, { method: 'PATCH', body: data });
}

export async function setAdminCreditPackBestValue(token: string, id: string): Promise<void> {
  await adminFetch(token, `/admin/credit-packs/${id}/best-value`, { method: 'POST' });
}

export async function deleteAdminCreditPack(token: string, id: string): Promise<void> {
  await adminFetch(token, `/admin/credit-packs/${id}`, { method: 'DELETE' });
}

export async function adjustUserCredits(token: string, userId: string, delta: number, note: string): Promise<void> {
  await adminFetch(token, `/admin/users/${userId}/credits/adjust`, { method: 'POST', body: { delta, note } });
}

export type AdminCreditReason = 'PURCHASE' | 'AI_USAGE' | 'MANUAL_ADMIN_ADJUSTMENT';

export interface AdminCreditTransaction {
  id: string;
  userId: string;
  delta: number;
  reason: AdminCreditReason;
  adminNote: string | null;
  createdAt: string;
  user: { email: string; name: string | null };
}

export async function fetchAdminCreditTransactions(
  token: string,
  filters: { userId?: string; reason?: AdminCreditReason } = {}
): Promise<AdminCreditTransaction[]> {
  return adminFetch<AdminCreditTransaction[]>(token, '/admin/credit-transactions', { query: filters });
}

// --- CMS (Site Content) ---

export interface AdminCmsPageSummary {
  slug: string;
  label: string;
}

export interface AdminCmsSection {
  key: string;
  label: string;
  order: number;
  fields: unknown;
  hasUnpublishedChanges: boolean;
  updatedAt: string;
}

export interface AdminCmsPageDraft {
  slug: string;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string[];
  ogImageUrl: string | null;
  sections: AdminCmsSection[];
}

export async function fetchAdminCmsPages(token: string): Promise<AdminCmsPageSummary[]> {
  return adminFetch<AdminCmsPageSummary[]>(token, '/admin/cms/pages');
}

export async function fetchAdminCmsPageDraft(token: string, slug: string): Promise<AdminCmsPageDraft> {
  return adminFetch<AdminCmsPageDraft>(token, `/admin/cms/pages/${slug}`);
}

export async function updateAdminCmsSection(token: string, slug: string, key: string, fields: unknown, locale: string = 'en'): Promise<void> {
  await adminFetch(token, `/admin/cms/pages/${slug}/sections/${key}`, { method: 'PATCH', body: { fields, locale } });
}

export async function updateAdminCmsSeo(
  token: string,
  slug: string,
  data: { metaTitle?: string; metaDescription?: string; metaKeywords?: string[]; ogImageUrl?: string }
): Promise<void> {
  await adminFetch(token, `/admin/cms/pages/${slug}/seo`, { method: 'PATCH', body: data });
}

export async function publishAdminCmsPage(token: string, slug: string): Promise<{ publishedCount: number }> {
  return adminFetch<{ publishedCount: number }>(token, `/admin/cms/pages/${slug}/publish`, { method: 'POST' });
}

export async function discardAdminCmsDrafts(token: string, slug: string): Promise<void> {
  await adminFetch(token, `/admin/cms/pages/${slug}/discard`, { method: 'POST' });
}

// --- Billing admin (Part 9 §2) ---

export type AdminPaymentTransactionType = 'SUBSCRIPTION_PAYMENT' | 'CREDIT_PURCHASE' | 'REFUND';
export type AdminPaymentTransactionStatus = 'SUCCEEDED' | 'FAILED' | 'REFUNDED';

export interface AdminPaymentTransaction {
  id: string;
  userId: string;
  type: AdminPaymentTransactionType;
  status: AdminPaymentTransactionStatus;
  amountCents: number;
  provider: string;
  providerReferenceId: string | null;
  createdAt: string;
  user: { email: string; name: string | null };
}

export interface AdminPaymentTransactionsResult {
  transactions: AdminPaymentTransaction[];
  total: number;
  page: number;
  pageSize: number;
}

export async function fetchAdminTransactions(
  token: string,
  filters: { status?: AdminPaymentTransactionStatus; type?: AdminPaymentTransactionType; page?: number } = {}
): Promise<AdminPaymentTransactionsResult> {
  return adminFetch<AdminPaymentTransactionsResult>(token, '/admin/billing/transactions', {
    query: { status: filters.status, type: filters.type, page: filters.page ? String(filters.page) : undefined },
  });
}

export interface AdminFailedPaymentUser {
  id: string;
  email: string;
  name: string | null;
  plan: AdminPlan;
  billingCycle: AdminBillingCycle | null;
  dunningAttemptCount: number;
  lastPaymentFailedAt: string | null;
  nextDunningRetryAt: string | null;
}

export async function fetchAdminFailedPayments(token: string): Promise<{ users: AdminFailedPaymentUser[] }> {
  return adminFetch(token, '/admin/billing/failed-payments');
}

export async function retryAdminFailedPayment(token: string, userId: string): Promise<{ recovered: boolean }> {
  return adminFetch(token, `/admin/billing/failed-payments/${userId}/retry`, { method: 'POST' });
}

export interface AdminPaymentProvider {
  name: string;
  configured: boolean;
  maskedKey: string | null;
  enabled: boolean;
}

export async function fetchAdminPaymentProvider(token: string): Promise<AdminPaymentProvider> {
  return adminFetch(token, '/admin/billing/payment-provider');
}

export async function cancelUserSubscription(token: string, userId: string, immediately: boolean): Promise<void> {
  await adminFetch(token, `/admin/users/${userId}/subscription/cancel`, { method: 'POST', body: { immediately } });
}

export async function extendUserSubscription(token: string, userId: string, renewalDate: string): Promise<void> {
  await adminFetch(token, `/admin/users/${userId}/subscription/extend`, { method: 'POST', body: { renewalDate } });
}

export async function refundUserLastPayment(token: string, userId: string): Promise<{ amountCents: number }> {
  return adminFetch(token, `/admin/users/${userId}/subscription/refund`, { method: 'POST' });
}

// Manual plan override — no Lemon Squeezy subscription is created, so this
// is for comps/testing only; a real upgrade always goes through checkout.
export async function setUserPlan(
  token: string,
  userId: string,
  plan: AdminPlan,
  billingCycle?: AdminBillingCycle
): Promise<void> {
  await adminFetch(token, `/admin/users/${userId}/plan`, { method: 'POST', body: { plan, billingCycle } });
}

// --- Affiliate program admin (Part 9 §4.4) ---

export type AdminAffiliateLinkStatus = 'ACTIVE' | 'BLOCKED';
export type AdminPayoutMethod = 'BANK_TRANSFER' | 'PAYPAL';
export type AdminPayoutStatus = 'UNDER_REVIEW' | 'COMPLETED';

export interface AdminAffiliateSummary {
  userId: string;
  email: string;
  name: string | null;
  code: string;
  status: AdminAffiliateLinkStatus;
  clicks: number;
  referrals: number;
  totalCommissionsCents: number;
}

export async function fetchAdminAffiliates(token: string): Promise<AdminAffiliateSummary[]> {
  return adminFetch(token, '/admin/affiliate/list');
}

export interface AdminAffiliateReferral {
  maskedName: string;
  signupDate: string;
  status: 'active' | 'cancelled';
  commissionEarnedCents: number;
  isRenewing: boolean;
}

export interface AdminAffiliatePayout {
  id: string;
  method: AdminPayoutMethod;
  amountCents: number;
  netAmountCents: number;
  status: AdminPayoutStatus;
  createdAt: string;
  completedAt: string | null;
}

export interface AdminAffiliateDetail {
  status: AdminAffiliateLinkStatus;
  referralLink: string;
  clicks: number;
  successfulReferrals: number;
  earningsThisMonthCents: number;
  totalEarningsCents: number;
  withdrawableBalanceCents: number;
  referrals: AdminAffiliateReferral[];
  payouts: AdminAffiliatePayout[];
}

export async function fetchAdminAffiliateDetail(token: string, userId: string): Promise<AdminAffiliateDetail> {
  return adminFetch(token, `/admin/affiliate/${userId}`);
}

export async function blockAdminAffiliate(token: string, userId: string): Promise<void> {
  await adminFetch(token, `/admin/affiliate/${userId}/block`, { method: 'POST' });
}

export async function deleteAdminAffiliateData(token: string, userId: string): Promise<void> {
  await adminFetch(token, `/admin/affiliate/${userId}`, { method: 'DELETE' });
}

export async function markAdminAffiliatePaid(token: string, userId: string, transactionReference: string): Promise<void> {
  await adminFetch(token, `/admin/affiliate/${userId}/mark-paid`, { method: 'POST', body: { transactionReference } });
}

export interface AdminPayoutRequestRow {
  id: string;
  userId: string;
  method: AdminPayoutMethod;
  amountCents: number;
  netAmountCents: number;
  status: AdminPayoutStatus;
  createdAt: string;
  user: { email: string; name: string | null };
}

export async function fetchAdminPayoutRequests(token: string): Promise<AdminPayoutRequestRow[]> {
  return adminFetch(token, '/admin/affiliate/payouts/all');
}

export async function confirmAdminPayout(token: string, payoutId: string, transactionReference: string): Promise<void> {
  await adminFetch(token, `/admin/affiliate/payouts/${payoutId}/confirm`, { method: 'POST', body: { transactionReference } });
}

export interface AdminAffiliateLeaderboardRow {
  userId: string;
  email: string;
  name: string | null;
  totalCommissionsCents: number;
}

export async function fetchAdminAffiliateLeaderboard(token: string): Promise<AdminAffiliateLeaderboardRow[]> {
  return adminFetch(token, '/admin/affiliate/leaderboard/top');
}
