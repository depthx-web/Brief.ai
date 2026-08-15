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

export interface DuplicatePayment {
  description: string;
  amount: string;
  occurrences: number;
}

export interface DuplicatePaymentReport {
  duplicates: DuplicatePayment[];
}

export async function detectDuplicatePayments(pages: PageText[], token?: string): Promise<DuplicatePaymentReport> {
  return postJson<DuplicatePaymentReport>('/ai/detect-duplicate-payments', { pages }, token);
}

export interface CompareFlag {
  excerpt: string;
  riskLevel: 'low' | 'medium' | 'high';
  explanation: string;
}

export interface CompareResult {
  flags: CompareFlag[];
}

export async function compareContracts(
  pagesA: PageText[],
  pagesB: PageText[],
  token?: string,
  docType?: string
): Promise<CompareResult> {
  return postJson<CompareResult>('/ai/compare-contracts', { pagesA, pagesB, docType }, token);
}

export async function comparePapers(pagesA: PageText[], pagesB: PageText[], token?: string): Promise<CompareResult> {
  return postJson<CompareResult>('/ai/compare-papers', { pagesA, pagesB }, token);
}

export async function summarizePlain(pages: PageText[], token?: string, docType?: string): Promise<string> {
  const { summary } = await postJson<{ summary: string }>('/ai/summarize-plain', { pages, docType }, token);
  return summary;
}

export interface NdaCriterion {
  name: string;
  status: 'ok' | 'missing' | 'concern';
  detail: string;
}

export interface NdaAudit {
  criteria: NdaCriterion[];
}

export async function auditNda(pages: PageText[], token?: string): Promise<NdaAudit> {
  return postJson<NdaAudit>('/ai/audit-nda', { pages }, token);
}

export interface SensitiveDataItem {
  excerpt: string;
  type: string;
}

export interface SensitiveDataReport {
  items: SensitiveDataItem[];
}

export async function detectSensitiveData(pages: PageText[], token?: string): Promise<SensitiveDataReport> {
  return postJson<SensitiveDataReport>('/ai/detect-sensitive-data', { pages }, token);
}

export interface FinancialRatio {
  name: string;
  value: string;
  explanation: string;
}

export interface FinancialRatioReport {
  ratios: FinancialRatio[];
}

export async function analyzeFinancialRatios(pages: PageText[], token?: string): Promise<FinancialRatioReport> {
  return postJson<FinancialRatioReport>('/ai/analyze-financial-ratios', { pages }, token);
}

export interface ReconciliationDiscrepancy {
  description: string;
  amount: string;
  side: 'bank' | 'records';
}

export interface ReconciliationReport {
  matchedCount: number;
  discrepancies: ReconciliationDiscrepancy[];
}

export async function reconcileBank(
  pagesBank: PageText[],
  pagesRecords: PageText[],
  token?: string
): Promise<ReconciliationReport> {
  return postJson<ReconciliationReport>('/ai/reconcile-bank', { pagesBank, pagesRecords }, token);
}

export interface DeductibleExpenseItem {
  description: string;
  amount: string;
  reason: string;
}

export interface DeductibleExpenseReport {
  items: DeductibleExpenseItem[];
}

export async function flagDeductibleExpenses(pages: PageText[], token?: string): Promise<DeductibleExpenseReport> {
  return postJson<DeductibleExpenseReport>('/ai/flag-deductible-expenses', { pages }, token);
}

export interface MethodologyExtract {
  sample: string;
  tools: string;
  statisticalAnalysis: string;
}

export async function extractMethodology(pages: PageText[], token?: string): Promise<MethodologyExtract> {
  return postJson<MethodologyExtract>('/ai/extract-methodology', { pages }, token);
}

export async function generateOutline(pages: PageText[], token?: string): Promise<string> {
  const { outline } = await postJson<{ outline: string }>('/ai/generate-outline', { pages }, token);
  return outline;
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
