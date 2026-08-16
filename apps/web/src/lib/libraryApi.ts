const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface LibraryDocumentSummary {
  id: string;
  filename: string;
  docType: string | null;
  projectId: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface LibrarySearchResult extends LibraryDocumentSummary {
  snippet: string;
  score: number;
}

export interface ProjectSummary {
  id: string;
  name: string;
  category: string | null;
  createdAt: string;
  // The closest-to-expiry file in the project — null if empty or no file
  // carries a retention window. Drives the countdown badge.
  nearestExpiresAt: string | null;
  documentCount: number;
}

export interface ProjectDetail {
  id: string;
  name: string;
  category: string | null;
  createdAt: string;
  documents: LibraryDocumentSummary[];
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

export async function uploadDocument(
  token: string,
  file: File,
  text: string,
  docType?: string,
  projectId?: string,
  retentionDays?: number
): Promise<LibraryDocumentSummary> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('text', text);
  if (docType) formData.append('docType', docType);
  if (projectId) formData.append('projectId', projectId);
  if (retentionDays) formData.append('retentionDays', String(retentionDays));

  let response: Response;
  try {
    response = await fetch(`${API_URL}/library/documents`, {
      method: 'POST',
      headers: authHeaders(token),
      body: formData,
    });
  } catch {
    throw new Error('Could not reach the server. Make sure the API (docker compose) is running.');
  }
  return handleResponse<LibraryDocumentSummary>(response);
}

export async function listDocuments(token: string): Promise<LibraryDocumentSummary[]> {
  const response = await fetch(`${API_URL}/library/documents`, { headers: authHeaders(token) });
  return handleResponse<LibraryDocumentSummary[]>(response);
}

export async function renameDocument(token: string, id: string, filename: string): Promise<LibraryDocumentSummary> {
  const response = await fetch(`${API_URL}/library/documents/${id}`, {
    method: 'PATCH',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename }),
  });
  return handleResponse<LibraryDocumentSummary>(response);
}

export async function deleteDocument(token: string, id: string): Promise<void> {
  const response = await fetch(`${API_URL}/library/documents/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  await handleResponse<{ success: boolean }>(response);
}

export async function fetchDocumentFile(token: string, id: string, fallbackFilename?: string): Promise<File> {
  const response = await fetch(`${API_URL}/library/documents/${id}/file`, {
    headers: authHeaders(token),
  });
  if (!response.ok) throw new Error(`Could not load this file (${response.status}).`);
  const disposition = response.headers.get('Content-Disposition') ?? '';
  const match = disposition.match(/filename="([^"]+)"/);
  const filename = match?.[1] ?? fallbackFilename ?? 'document.pdf';
  const blob = await response.blob();
  return new File([blob], filename, { type: 'application/pdf' });
}

export async function downloadDocument(token: string, id: string, filename: string): Promise<void> {
  const file = await fetchDocumentFile(token, id, filename);
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function createProject(token: string, name: string, category?: string): Promise<ProjectSummary> {
  const response = await fetch(`${API_URL}/library/projects`, {
    method: 'POST',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, category }),
  });
  return handleResponse<ProjectSummary>(response);
}

export async function renameProject(token: string, id: string, name: string): Promise<ProjectSummary> {
  const response = await fetch(`${API_URL}/library/projects/${id}`, {
    method: 'PATCH',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  return handleResponse<ProjectSummary>(response);
}

export async function listProjects(token: string): Promise<ProjectSummary[]> {
  const response = await fetch(`${API_URL}/library/projects`, { headers: authHeaders(token) });
  return handleResponse<ProjectSummary[]>(response);
}

export async function getProject(token: string, id: string): Promise<ProjectDetail> {
  const response = await fetch(`${API_URL}/library/projects/${id}`, { headers: authHeaders(token) });
  return handleResponse<ProjectDetail>(response);
}

export async function extendProjectRetention(token: string, id: string, days: 7 | 30): Promise<{ expiresAt: string }> {
  const response = await fetch(`${API_URL}/library/projects/${id}/retention`, {
    method: 'PATCH',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ days }),
  });
  return handleResponse<{ expiresAt: string }>(response);
}

export async function deleteProject(token: string, id: string): Promise<void> {
  const response = await fetch(`${API_URL}/library/projects/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  await handleResponse<{ success: boolean }>(response);
}

export async function searchLibrary(token: string, query: string): Promise<LibrarySearchResult[]> {
  const response = await fetch(`${API_URL}/library/search`, {
    method: 'POST',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  return handleResponse<LibrarySearchResult[]>(response);
}
