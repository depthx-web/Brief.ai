const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface SavedSignature {
  id: string;
  name: string;
  imageData: string;
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

export async function listSignatures(token: string): Promise<SavedSignature[]> {
  const response = await fetch(`${API_URL}/signatures`, { headers: { Authorization: `Bearer ${token}` } });
  return handleResponse<SavedSignature[]>(response);
}

export async function saveSignature(token: string, name: string, imageData: string): Promise<SavedSignature> {
  const response = await fetch(`${API_URL}/signatures`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name, imageData }),
  });
  return handleResponse<SavedSignature>(response);
}

export async function deleteSignature(token: string, id: string): Promise<void> {
  const response = await fetch(`${API_URL}/signatures/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  await handleResponse<{ success: boolean }>(response);
}
