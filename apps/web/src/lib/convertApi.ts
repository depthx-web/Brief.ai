const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function postForm(
  path: string,
  formData: FormData,
  fallbackFilename: string
): Promise<{ blob: Blob; filename: string }> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { method: 'POST', body: formData });
  } catch {
    throw new Error(
      'Could not reach the conversion server. Make sure the API (docker compose) is running.'
    );
  }

  if (!response.ok) {
    let message = `Request failed (${response.status}).`;
    try {
      const body = await response.json();
      if (typeof body?.message === 'string') message = body.message;
    } catch {
      // response wasn't JSON — keep the generic message
    }
    throw new Error(message);
  }

  const disposition = response.headers.get('Content-Disposition') ?? '';
  const match = disposition.match(/filename="([^"]+)"/);
  const filename = match?.[1] ?? fallbackFilename;

  const blob = await response.blob();
  return { blob, filename };
}

export async function convertFile(file: File, to: string): Promise<{ blob: Blob; filename: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const baseName = file.name.replace(/\.[^.]+$/, '');
  return postForm(`/convert?to=${encodeURIComponent(to)}`, formData, `${baseName}.${to}`);
}

// Passwords go in the multipart body (not the query string) so they don't
// end up in URLs, access logs, or browser history.
export async function protectPdf(
  file: File,
  password: string,
  ownerPassword?: string
): Promise<{ blob: Blob; filename: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('password', password);
  if (ownerPassword) formData.append('ownerPassword', ownerPassword);
  const baseName = file.name.replace(/\.pdf$/i, '');
  return postForm('/protect', formData, `${baseName}-protected.pdf`);
}

export async function unlockPdf(
  file: File,
  password: string
): Promise<{ blob: Blob; filename: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('password', password);
  const baseName = file.name.replace(/\.pdf$/i, '');
  return postForm('/unlock', formData, `${baseName}-unlocked.pdf`);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
