const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export type Segment = 'LAWYER' | 'ACCOUNTANT' | 'RESEARCHER';
export type Plan = 'FREE' | 'PAID';
export type BillingCycle = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  segment: Segment | null;
  plan: Plan;
  billingCycle: BillingCycle | null;
  // Null = platform default (24h). 0 = "Never" (paid plans only).
  defaultRetentionHours: number | null;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
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

async function post<T>(path: string, body: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Could not reach the server. Make sure the API (docker compose) is running.');
  }
  return handleResponse<T>(response);
}

export function signup(
  email: string,
  password: string,
  name?: string,
  segment?: Segment,
  referralCode?: string
): Promise<AuthResponse> {
  return post<AuthResponse>('/auth/signup', { email, password, name, segment, referralCode });
}

export function login(email: string, password: string): Promise<AuthResponse> {
  return post<AuthResponse>('/auth/login', { email, password });
}

export async function fetchMe(token: string): Promise<AuthUser> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new Error('Could not reach the server.');
  }
  return handleResponse<AuthUser>(response);
}

export async function updateProfile(
  token: string,
  data: { name?: string; segment?: Segment; defaultRetentionHours?: number | null }
): Promise<AuthUser> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/auth/me`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  } catch {
    throw new Error('Could not reach the server.');
  }
  return handleResponse<AuthUser>(response);
}

export async function changePassword(token: string, currentPassword: string, newPassword: string): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/auth/me/password`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  } catch {
    throw new Error('Could not reach the server.');
  }
  await handleResponse<{ success: boolean }>(response);
}

export async function changeEmail(token: string, newEmail: string, currentPassword: string): Promise<AuthUser> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/auth/me/email`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ newEmail, currentPassword }),
    });
  } catch {
    throw new Error('Could not reach the server.');
  }
  return handleResponse<AuthUser>(response);
}

export async function deleteAccount(token: string): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/auth/me`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new Error('Could not reach the server.');
  }
  await handleResponse<{ success: boolean }>(response);
}
