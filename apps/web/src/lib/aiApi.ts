import type { PageText } from './extractPdfText';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function postJson<T>(path: string, body: unknown, token?: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(
      'Could not reach the AI server. Make sure the API (docker compose) is running.'
    );
  }

  if (!response.ok) {
    let message = `Request failed (${response.status}).`;
    try {
      const errBody = await response.json();
      if (typeof errBody?.message === 'string') message = errBody.message;
    } catch {
      // not JSON — keep generic message
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export type SummaryStyle = 'executive' | 'bullets';
export type SummaryLength = 'short' | 'medium' | 'long';

export async function summarizeDocument(
  pages: PageText[],
  style: SummaryStyle,
  length: SummaryLength,
  token?: string,
  docType?: string
): Promise<string> {
  const { summary } = await postJson<{ summary: string }>(
    '/ai/summarize',
    { pages, style, length, docType },
    token
  );
  return summary;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatTextResult {
  type: 'text';
  content: string;
}

export interface ChatFileResult {
  type: 'file';
  title: string;
  filename: string;
  content: string;
}

export type ChatResult = ChatTextResult | ChatFileResult;

export async function askDocument(
  pages: PageText[],
  history: ChatMessage[],
  question: string,
  token?: string,
  docType?: string
): Promise<ChatResult> {
  return postJson<ChatResult>('/ai/chat', { pages, history, question, docType }, token);
}

export interface ClauseFlag {
  excerpt: string;
  category: string;
  explanation: string;
}

export interface ClauseAnalysis {
  clauses: ClauseFlag[];
  entities: {
    parties: string[];
    dates: string[];
    amounts: string[];
    obligations: string[];
  };
}

export async function analyzeClauses(pages: PageText[], token?: string, docType?: string): Promise<ClauseAnalysis> {
  return postJson<ClauseAnalysis>('/ai/analyze-clauses', { pages, docType }, token);
}

export type ReferenceFormat = 'bibtex' | 'apa' | 'mla';

export async function extractReferences(
  pages: PageText[],
  format: ReferenceFormat,
  token?: string,
  docType?: string
): Promise<string> {
  const { references } = await postJson<{ references: string }>(
    '/ai/extract-references',
    { pages, format, docType },
    token
  );
  return references;
}

export interface InvoiceLineItem {
  description: string;
  quantity: string;
  unitPrice: string;
  amount: string;
}

export interface InvoiceData {
  vendor: string;
  invoiceNumber: string;
  date: string;
  lineItems: InvoiceLineItem[];
  total: string;
  category: string;
}

export async function extractInvoiceData(pages: PageText[], token?: string, docType?: string): Promise<InvoiceData> {
  return postJson<InvoiceData>('/ai/extract-invoice', { pages, docType }, token);
}

export type AiActivityStatus = 'PROCESSING' | 'SUCCESS' | 'FAILED';

export interface AiActivityJob {
  id: string;
  operation: string;
  status: AiActivityStatus;
  createdAt: string;
}

export interface AiActivity {
  jobs: AiActivityJob[];
  monthlyCount: number;
}

export async function fetchMyActivity(token: string): Promise<AiActivity> {
  const response = await fetch(`${API_URL}/ai/activity`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}).`);
  }
  return response.json() as Promise<AiActivity>;
}
