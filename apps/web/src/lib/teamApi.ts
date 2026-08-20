const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface TeamMemberSummary {
  userId: string;
  email: string;
  name: string | null;
  role: 'OWNER' | 'MEMBER';
  joinedAt: string;
  // Owner-only fields — null for a regular member viewing their own team.
  monthlyUsage: number | null;
  tokenBudgetOverride: number | null;
  canShareProjects: boolean;
}

export interface TeamInvitationSummary {
  id: string;
  email: string;
  createdAt: string;
  expiresAt: string;
}

export interface MyTeam {
  id: string;
  name: string;
  isOwner: boolean;
  members: TeamMemberSummary[];
  invitations: TeamInvitationSummary[];
}

export interface MemberProject {
  id: string;
  name: string;
  visibility: 'PRIVATE' | 'SHARED_WITH_TEAM';
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

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

export async function fetchMyTeam(token: string): Promise<MyTeam | null> {
  const response = await fetch(`${API_URL}/team/me`, { headers: authHeaders(token) });
  return handleResponse<MyTeam | null>(response);
}

export async function createTeam(token: string, name: string): Promise<{ id: string; name: string }> {
  const response = await fetch(`${API_URL}/team`, {
    method: 'POST',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  return handleResponse(response);
}

export async function inviteTeamMember(token: string, teamId: string, email: string): Promise<void> {
  const response = await fetch(`${API_URL}/team/${teamId}/invitations`, {
    method: 'POST',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  await handleResponse(response);
}

export async function revokeInvitation(token: string, invitationId: string): Promise<void> {
  const response = await fetch(`${API_URL}/team/invitations/${invitationId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  await handleResponse(response);
}

export async function fetchInvitation(inviteToken: string): Promise<{ teamName: string; email: string }> {
  const response = await fetch(`${API_URL}/team/invitations/${inviteToken}`);
  return handleResponse(response);
}

export async function acceptInvitation(token: string, inviteToken: string): Promise<void> {
  const response = await fetch(`${API_URL}/team/invitations/${inviteToken}/accept`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  await handleResponse(response);
}

export async function declineInvitation(inviteToken: string): Promise<void> {
  const response = await fetch(`${API_URL}/team/invitations/${inviteToken}/decline`, { method: 'POST' });
  await handleResponse(response);
}

export async function setMemberBudget(token: string, teamId: string, memberUserId: string, tokenBudgetOverride: number | null): Promise<void> {
  const response = await fetch(`${API_URL}/team/${teamId}/members/${memberUserId}/budget`, {
    method: 'PATCH',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ tokenBudgetOverride }),
  });
  await handleResponse(response);
}

export async function setCanShareProjects(token: string, teamId: string, memberUserId: string, canShareProjects: boolean): Promise<void> {
  const response = await fetch(`${API_URL}/team/${teamId}/members/${memberUserId}/sharing`, {
    method: 'PATCH',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ canShareProjects }),
  });
  await handleResponse(response);
}

export async function fetchMemberProjects(token: string, teamId: string, memberUserId: string): Promise<MemberProject[]> {
  const response = await fetch(`${API_URL}/team/${teamId}/members/${memberUserId}/projects`, { headers: authHeaders(token) });
  return handleResponse(response);
}

export async function setProjectVisibility(token: string, projectId: string, visibility: 'PRIVATE' | 'SHARED_WITH_TEAM'): Promise<void> {
  const response = await fetch(`${API_URL}/library/projects/${projectId}/visibility`, {
    method: 'PATCH',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ visibility }),
  });
  await handleResponse(response);
}
