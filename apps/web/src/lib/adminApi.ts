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
        'x-admin-token': token,
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
  user: AdminUserSummary & { subscriptionStatus: string | null };
  recentUploads: { id: string; filename: string; createdAt: string }[];
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
  segment: AdminSegment;
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

export type AdminEmailCampaignKey = 'WELCOME' | 'UPGRADE' | 'WINBACK' | 'SECURITY';

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
