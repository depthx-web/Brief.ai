const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface LibraryDocumentSummary {
  id: string;
  filename: string;
  docType: string | null;
  createdAt: string;
}

export interface LibrarySearchResult extends LibraryDocumentSummary {
  snippet: string;
  score: number;
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
  docType?: string
): Promise<LibraryDocumentSummary> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('text', text);
  if (docType) formData.append('docType', docType);

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

export async function searchLibrary(token: string, query: string): Promise<LibrarySearchResult[]> {
  const response = await fetch(`${API_URL}/library/search`, {
    method: 'POST',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  return handleResponse<LibrarySearchResult[]>(response);
}
