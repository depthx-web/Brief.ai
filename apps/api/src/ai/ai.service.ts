import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import type { AiOperation } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LiteLlmService } from './litellm.service';

export interface PageText {
  page: number;
  text: string;
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

export type SummaryStyle = 'executive' | 'bullets';
export type SummaryLength = 'short' | 'medium' | 'long';
export type ReferenceFormat = 'bibtex' | 'apa' | 'mla';

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

export interface CompareFlag {
  excerpt: string;
  riskLevel: 'low' | 'medium' | 'high';
  explanation: string;
}

export interface CompareResult {
  flags: CompareFlag[];
}

export interface NdaCriterion {
  name: string;
  status: 'ok' | 'missing' | 'concern';
  detail: string;
}

export interface NdaAudit {
  criteria: NdaCriterion[];
}

export interface SensitiveDataItem {
  excerpt: string;
  type: string;
}

export interface SensitiveDataReport {
  items: SensitiveDataItem[];
}

export interface FinancialRatio {
  name: string;
  value: string;
  explanation: string;
}

export interface FinancialRatioReport {
  ratios: FinancialRatio[];
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

export interface DeductibleExpenseItem {
  description: string;
  amount: string;
  reason: string;
}

export interface DeductibleExpenseReport {
  items: DeductibleExpenseItem[];
}

export interface DuplicatePayment {
  description: string;
  amount: string;
  occurrences: number;
}

export interface DuplicatePaymentReport {
  duplicates: DuplicatePayment[];
}

export interface MethodologyExtract {
  sample: string;
  tools: string;
  statisticalAnalysis: string;
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

// MVP context budget: no chunking/embeddings yet (that's the segment-specific
// semantic search work), just cap how much of the document we send.
const MAX_DOCUMENT_CHARS = 40_000;

// When LITELLM_PROXY_URL is set, every call routes through the self-hosted
// LiteLLM proxy using the task-simple/task-complex aliases defined in
// docker/litellm-config.yaml, instead of a hardcoded model name. Falling
// back to a direct DeepSeek call (the pre-LiteLLM behavior) keeps `npm run
// start:dev` working for anyone not also running the litellm compose service.
const LITELLM_PROXY_URL = process.env.LITELLM_PROXY_URL;
const DIRECT_MODEL = process.env.LLM_MODEL ?? 'deepseek-v4-flash';

// Per the AI routing spec: simple tasks (extraction, classification, short
// summaries) get the cheap/fast model; complex tasks (contract clause
// analysis, precise financial audit) get the stronger one.
const COMPLEX_OPERATIONS: AiOperation[] = [
  'ANALYZE_CLAUSES',
  'CHAT',
  'COMPARE_CONTRACTS',
  'COMPARE_PAPERS',
  'RECONCILE_BANK',
  'ANALYZE_FINANCIAL_RATIOS',
];

// Turns the dashboard's segment-specific document-type chip (e.g. "NDA" vs
// "Court memo") into extra system-prompt context, so two documents in the
// same segment but different sub-types get differently-focused analysis.
function docTypeContext(docType: string | undefined): string {
  return docType ? ` The document is specifically a(n) ${docType} — tailor your analysis to that document type.` : '';
}

function buildDocumentText(pages: PageText[]): { text: string; truncated: boolean } {
  let text = '';
  let truncated = false;
  for (const page of pages) {
    const block = `\n\n--- Page ${page.page} ---\n${page.text}`;
    if (text.length + block.length > MAX_DOCUMENT_CHARS) {
      truncated = true;
      break;
    }
    text += block;
  }
  return { text: text.trim(), truncated };
}

// Models sometimes wrap JSON in markdown fences despite instructions not to —
// strip those defensively before parsing rather than trusting raw output.
function parseJsonResponse<T>(raw: string): T {
  const stripped = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  try {
    return JSON.parse(stripped) as T;
  } catch {
    throw new Error('The AI response was not valid JSON.');
  }
}

// Chat responses are asked to self-report whether they're a normal answer or
// a file the user explicitly requested to download (see the chat() system
// prompt). Falls back to showing the raw text rather than erroring if the
// model doesn't follow the envelope — a malformed chat reply should still be
// readable, not a hard failure.
function parseChatResult(raw: string): ChatResult {
  try {
    const parsed = parseJsonResponse<{ type?: string; content?: string; title?: string; filename?: string }>(raw);
    if (parsed.type === 'file' && parsed.title && parsed.filename && typeof parsed.content === 'string') {
      return { type: 'file', title: parsed.title, filename: parsed.filename, content: parsed.content };
    }
    if (typeof parsed.content === 'string') {
      return { type: 'text', content: parsed.content };
    }
  } catch {
    // fall through to the raw-text fallback below
  }
  return { type: 'text', content: raw };
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly client: OpenAI;

  constructor(
    private readonly prisma: PrismaService,
    private readonly liteLlm: LiteLlmService
  ) {
    this.client = new OpenAI({
      apiKey: LITELLM_PROXY_URL ? (process.env.LITELLM_MASTER_KEY ?? '') : process.env.LLM_API_KEY,
      baseURL: LITELLM_PROXY_URL ?? (process.env.LLM_BASE_URL ?? 'https://api.deepseek.com'),
    });
  }

  async summarize(
    pages: PageText[],
    style: SummaryStyle,
    length: SummaryLength,
    userId?: string,
    docType?: string
  ): Promise<string> {
    return this.run('SUMMARIZE', userId, async () => {
      const { text, truncated } = buildDocumentText(pages);
      const lengthGuidance: Record<SummaryLength, string> = {
        short: 'about 3-4 sentences',
        medium: 'about 2-3 short paragraphs',
        long: 'a detailed summary of 5 or more paragraphs',
      };
      const styleGuidance =
        style === 'bullets'
          ? 'Format the summary as concise bullet points covering the key facts.'
          : 'Write the summary as flowing prose suitable for someone who has not read the document.';

      const completion = await this.client.chat.completions.create(
        {
          model: await this.modelFor('SUMMARIZE'),
          temperature: 0.3,
          messages: [
            {
              role: 'system',
              content:
                'You summarize documents accurately based only on the provided text. Do not invent information that is not in the document.' +
                docTypeContext(docType),
            },
            {
              role: 'user',
              content:
                `Summarize the following document. Length: ${lengthGuidance[length]}. ${styleGuidance}` +
                (truncated
                  ? '\n\n(Note: the document was truncated; only the first portion is shown below.)'
                  : '') +
                `\n\n${text}`,
            },
          ],
        },
        await this.requestOptions(userId)
      );
      return completion.choices[0]?.message?.content ?? '';
    });
  }

  async chat(
    pages: PageText[],
    history: ChatMessage[],
    question: string,
    userId?: string,
    docType?: string
  ): Promise<ChatResult> {
    return this.run('CHAT', userId, async () => {
      const { text, truncated } = buildDocumentText(pages);

      const completion = await this.client.chat.completions.create(
        {
          model: await this.modelFor('CHAT'),
          temperature: 0.2,
          messages: [
            {
              role: 'system',
              content:
                'You answer questions about the document below, using only information it contains. ' +
                'When you reference specific content, cite the page number like "(p. 3)". ' +
                "If the answer isn't in the document, say so clearly instead of guessing." +
                (truncated ? ' The document was truncated; only the first portion is available to you.' : '') +
                docTypeContext(docType) +
                '\n\nRespond with ONLY a valid JSON object (no markdown fences, no commentary) in one of ' +
                'these two shapes:\n' +
                '1) Normal answer: {"type":"text","content":string}\n' +
                '2) Only if the user explicitly asks you to produce a downloadable document (e.g. "give me ' +
                'a summary I can download", "export this data", "write a memo of the changes", "give me a ' +
                'PDF of..."): {"type":"file","title":string,"filename":string,"content":string}. title is a ' +
                'short human-readable title; filename is a short kebab-case name with no extension; content ' +
                'is the FULL plain-text body for the file (blank lines between sections, no markdown syntax).' +
                `\n\nDOCUMENT:\n${text}`,
            },
            ...history.map((m) => ({ role: m.role, content: m.content })),
            { role: 'user' as const, content: question },
          ],
        },
        await this.requestOptions(userId)
      );
      return parseChatResult(completion.choices[0]?.message?.content ?? '');
    });
  }

  async analyzeClauses(pages: PageText[], userId?: string, docType?: string): Promise<ClauseAnalysis> {
    return this.run('ANALYZE_CLAUSES', userId, async () => {
      const { text, truncated } = buildDocumentText(pages);

      const completion = await this.client.chat.completions.create(
        {
          model: await this.modelFor('ANALYZE_CLAUSES'),
          temperature: 0.2,
          messages: [
            {
              role: 'system',
              content:
                'You are a contract-review assistant. Analyze the contract text and respond with ONLY a ' +
                'valid JSON object (no markdown fences, no commentary) matching exactly this shape: ' +
                '{"clauses":[{"excerpt":string,"category":string,"explanation":string}],' +
                '"entities":{"parties":string[],"dates":string[],"amounts":string[],"obligations":string[]}}. ' +
                'For clauses, flag ones that are unfair, incomplete, or non-standard; category should be a ' +
                'short label such as "Unfair", "Incomplete", "Non-standard", or "Notable". List at most 10 ' +
                'clauses; if none stand out, use an empty array. Populate entities from the document; use ' +
                'empty arrays for anything not present.' +
                docTypeContext(docType),
            },
            {
              role: 'user',
              content: (truncated ? '(Document truncated to first portion.)\n\n' : '') + text,
            },
          ],
        },
        await this.requestOptions(userId)
      );
      return parseJsonResponse<ClauseAnalysis>(completion.choices[0]?.message?.content ?? '');
    });
  }

  async extractReferences(
    pages: PageText[],
    format: ReferenceFormat,
    userId?: string,
    docType?: string
  ): Promise<string> {
    return this.run('EXTRACT_REFERENCES', userId, async () => {
      const { text, truncated } = buildDocumentText(pages);
      const formatGuidance: Record<ReferenceFormat, string> = {
        bibtex: 'BibTeX entries (one @-block per reference)',
        apa: 'APA 7th edition reference list format',
        mla: 'MLA 9th edition works-cited format',
      };

      const completion = await this.client.chat.completions.create(
        {
          model: await this.modelFor('EXTRACT_REFERENCES'),
          temperature: 0.1,
          messages: [
            {
              role: 'system',
              content:
                'You extract the bibliography/reference list from an academic paper. Respond with ONLY the ' +
                `formatted reference list in ${formatGuidance[format]}, nothing else — no preamble, no ` +
                'explanation. If no references are found, respond with exactly: No references found.' +
                docTypeContext(docType),
            },
            {
              role: 'user',
              content: (truncated ? '(Document truncated to first portion.)\n\n' : '') + text,
            },
          ],
        },
        await this.requestOptions(userId)
      );
      return completion.choices[0]?.message?.content ?? '';
    });
  }

  async extractInvoiceData(pages: PageText[], userId?: string, docType?: string): Promise<InvoiceData> {
    return this.run('EXTRACT_INVOICE', userId, async () => {
      const { text, truncated } = buildDocumentText(pages);

      const completion = await this.client.chat.completions.create(
        {
          model: await this.modelFor('EXTRACT_INVOICE'),
          temperature: 0.1,
          messages: [
            {
              role: 'system',
              content:
                'You extract structured data from an invoice or receipt. Respond with ONLY a valid JSON ' +
                'object (no markdown fences, no commentary) matching exactly this shape: ' +
                '{"vendor":string,"invoiceNumber":string,"date":string,"lineItems":[{"description":string,' +
                '"quantity":string,"unitPrice":string,"amount":string}],"total":string,"category":string}. ' +
                'category should be a short expense category such as "Office Supplies", "Travel", ' +
                '"Software", "Utilities", "Professional Services", or "Other". Use empty string for any ' +
                "field you can't find, and an empty array for lineItems if none are identifiable." +
                docTypeContext(docType),
            },
            {
              role: 'user',
              content: (truncated ? '(Document truncated to first portion.)\n\n' : '') + text,
            },
          ],
        },
        await this.requestOptions(userId)
      );
      return parseJsonResponse<InvoiceData>(completion.choices[0]?.message?.content ?? '');
    });
  }

  // Flags only the AI-judgment layer of a compare — the actual word-level
  // diff (additions/deletions/reworded counts, highlighted text) is computed
  // client-side with the `diff` package, which needs no model call at all.
  // This just annotates a handful of the most consequential changes with a
  // risk level, matched back to diff chunks by substring on the frontend.
  async compareContracts(pagesA: PageText[], pagesB: PageText[], userId?: string, docType?: string): Promise<CompareResult> {
    return this.run('COMPARE_CONTRACTS', userId, async () => {
      const a = buildDocumentText(pagesA);
      const b = buildDocumentText(pagesB);
      const completion = await this.client.chat.completions.create(
        {
          model: await this.modelFor('COMPARE_CONTRACTS'),
          temperature: 0.2,
          messages: [
            {
              role: 'system',
              content:
                'You compare two versions of the same contract. Respond with ONLY a valid JSON object ' +
                '(no markdown fences, no commentary) matching exactly this shape: {"flags":[{"excerpt":' +
                'string,"riskLevel":"low"|"medium"|"high","explanation":string}]}. excerpt must be copied ' +
                'verbatim (a short phrase, not a full sentence) from whichever version it appears in, so it ' +
                'can be matched back to the text. Only include changes that meaningfully affect obligations, ' +
                'risk, dates, or amounts — not wording-only edits. List at most 8 flags.' +
                docTypeContext(docType),
            },
            {
              role: 'user',
              content: `VERSION A (old):\n${a.text}\n\nVERSION B (new):\n${b.text}`,
            },
          ],
        },
        await this.requestOptions(userId)
      );
      return parseJsonResponse<CompareResult>(completion.choices[0]?.message?.content ?? '');
    });
  }

  async summarizePlain(pages: PageText[], userId?: string, docType?: string): Promise<string> {
    return this.run('SUMMARIZE_PLAIN', userId, async () => {
      const { text, truncated } = buildDocumentText(pages);
      const completion = await this.client.chat.completions.create(
        {
          model: await this.modelFor('SUMMARIZE_PLAIN'),
          temperature: 0.3,
          messages: [
            {
              role: 'system',
              content:
                'You explain a legal document in plain language for a client with no legal background. ' +
                'Avoid legal jargon; where a legal term is unavoidable, briefly explain it in parentheses. ' +
                'Write 3-5 short paragraphs covering what the document means for them in practice.' +
                docTypeContext(docType),
            },
            {
              role: 'user',
              content: (truncated ? '(Document truncated to first portion.)\n\n' : '') + text,
            },
          ],
        },
        await this.requestOptions(userId)
      );
      return completion.choices[0]?.message?.content ?? '';
    });
  }

  async auditNda(pages: PageText[], userId?: string): Promise<NdaAudit> {
    return this.run('AUDIT_NDA', userId, async () => {
      const { text, truncated } = buildDocumentText(pages);
      const completion = await this.client.chat.completions.create(
        {
          model: await this.modelFor('AUDIT_NDA'),
          temperature: 0.1,
          messages: [
            {
              role: 'system',
              content:
                'You audit an NDA against three standard criteria: "Confidentiality duration", ' +
                '"Exceptions to confidentiality", and "Scope of protection". Respond with ONLY a valid ' +
                'JSON object (no markdown fences, no commentary) matching exactly this shape: {"criteria":' +
                '[{"name":string,"status":"ok"|"missing"|"concern","detail":string}]} — exactly one entry ' +
                'per criterion, in that order. status is "missing" if the NDA does not address it at all, ' +
                '"concern" if addressed but unusually one-sided or vague, "ok" otherwise.',
            },
            {
              role: 'user',
              content: (truncated ? '(Document truncated to first portion.)\n\n' : '') + text,
            },
          ],
        },
        await this.requestOptions(userId)
      );
      return parseJsonResponse<NdaAudit>(completion.choices[0]?.message?.content ?? '');
    });
  }

  async detectSensitiveData(pages: PageText[], userId?: string): Promise<SensitiveDataReport> {
    return this.run('DETECT_SENSITIVE_DATA', userId, async () => {
      const { text, truncated } = buildDocumentText(pages);
      const completion = await this.client.chat.completions.create(
        {
          model: await this.modelFor('DETECT_SENSITIVE_DATA'),
          temperature: 0.1,
          messages: [
            {
              role: 'system',
              content:
                'You scan a document for personally identifiable or financial data that should typically be ' +
                'redacted before external sharing — national ID numbers, passport numbers, bank account or ' +
                'card numbers, and similar identifiers. Respond with ONLY a valid JSON object (no markdown ' +
                'fences, no commentary) matching exactly this shape: {"items":[{"excerpt":string,"type":' +
                'string}]}. excerpt must be copied verbatim from the document (redact none of it yourself — ' +
                'this is only a detection pass). type is a short label like "National ID", "Bank account ' +
                'number", or "Card number". Return an empty array if nothing is found.',
            },
            {
              role: 'user',
              content: (truncated ? '(Document truncated to first portion.)\n\n' : '') + text,
            },
          ],
        },
        await this.requestOptions(userId)
      );
      return parseJsonResponse<SensitiveDataReport>(completion.choices[0]?.message?.content ?? '');
    });
  }

  async analyzeFinancialRatios(pages: PageText[], userId?: string): Promise<FinancialRatioReport> {
    return this.run('ANALYZE_FINANCIAL_RATIOS', userId, async () => {
      const { text, truncated } = buildDocumentText(pages);
      const completion = await this.client.chat.completions.create(
        {
          model: await this.modelFor('ANALYZE_FINANCIAL_RATIOS'),
          temperature: 0.1,
          messages: [
            {
              role: 'system',
              content:
                'You extract core financial ratios from a financial statement — at minimum current ratio ' +
                '(liquidity) and net profit margin (profitability) where the underlying figures are present, ' +
                'plus any other clearly computable ratio. Respond with ONLY a valid JSON object (no markdown ' +
                'fences, no commentary) matching exactly this shape: {"ratios":[{"name":string,"value":' +
                'string,"explanation":string}]}. explanation should be one plain-language sentence on what ' +
                'the ratio means for this business. Omit a ratio entirely if the source figures are not in ' +
                'the document — do not estimate or invent numbers.',
            },
            {
              role: 'user',
              content: (truncated ? '(Document truncated to first portion.)\n\n' : '') + text,
            },
          ],
        },
        await this.requestOptions(userId)
      );
      return parseJsonResponse<FinancialRatioReport>(completion.choices[0]?.message?.content ?? '');
    });
  }

  async reconcileBank(pagesBank: PageText[], pagesRecords: PageText[], userId?: string): Promise<ReconciliationReport> {
    return this.run('RECONCILE_BANK', userId, async () => {
      const bank = buildDocumentText(pagesBank);
      const records = buildDocumentText(pagesRecords);
      const completion = await this.client.chat.completions.create(
        {
          model: await this.modelFor('RECONCILE_BANK'),
          temperature: 0.1,
          messages: [
            {
              role: 'system',
              content:
                'You reconcile a bank transaction list against a set of recorded invoices/payments. Match ' +
                'transactions by amount and approximate date/description. Respond with ONLY a valid JSON ' +
                'object (no markdown fences, no commentary) matching exactly this shape: {"matchedCount":' +
                'number,"discrepancies":[{"description":string,"amount":string,"side":"bank"|"records"}]}. ' +
                'side "bank" means the transaction appears on the bank statement with no matching invoice; ' +
                '"records" means the reverse — an invoice with no matching bank transaction.',
            },
            {
              role: 'user',
              content: `BANK TRANSACTIONS:\n${bank.text}\n\nRECORDED INVOICES/PAYMENTS:\n${records.text}`,
            },
          ],
        },
        await this.requestOptions(userId)
      );
      return parseJsonResponse<ReconciliationReport>(completion.choices[0]?.message?.content ?? '');
    });
  }

  async flagDeductibleExpenses(pages: PageText[], userId?: string): Promise<DeductibleExpenseReport> {
    return this.run('FLAG_DEDUCTIBLE_EXPENSES', userId, async () => {
      const { text, truncated } = buildDocumentText(pages);
      const completion = await this.client.chat.completions.create(
        {
          model: await this.modelFor('FLAG_DEDUCTIBLE_EXPENSES'),
          temperature: 0.1,
          messages: [
            {
              role: 'system',
              content:
                'You review expense line items and flag ones that commonly qualify as tax-deductible ' +
                'business expenses, based on their category (e.g. office supplies, professional services, ' +
                'business travel, software subscriptions). Respond with ONLY a valid JSON object (no ' +
                'markdown fences, no commentary) matching exactly this shape: {"items":[{"description":' +
                'string,"amount":string,"reason":string}]}. This is a suggestion only, not tax advice — ' +
                'reason should stay factual about the category, not make a legal determination.',
            },
            {
              role: 'user',
              content: (truncated ? '(Document truncated to first portion.)\n\n' : '') + text,
            },
          ],
        },
        await this.requestOptions(userId)
      );
      return parseJsonResponse<DeductibleExpenseReport>(completion.choices[0]?.message?.content ?? '');
    });
  }

  async detectDuplicatePayments(pages: PageText[], userId?: string): Promise<DuplicatePaymentReport> {
    return this.run('DETECT_DUPLICATE_PAYMENTS', userId, async () => {
      const { text, truncated } = buildDocumentText(pages);
      const completion = await this.client.chat.completions.create(
        {
          model: await this.modelFor('DETECT_DUPLICATE_PAYMENTS'),
          temperature: 0.1,
          messages: [
            {
              role: 'system',
              content:
                'You scan a batch of invoices or payment records for likely duplicate payments — the same ' +
                'vendor, amount, and approximate date appearing more than once. Respond with ONLY a valid ' +
                'JSON object (no markdown fences, no commentary) matching exactly this shape: {"duplicates":' +
                '[{"description":string,"amount":string,"occurrences":number}]}. Only include genuine ' +
                'probable duplicates, not merely similar recurring charges (e.g. monthly subscriptions are ' +
                'not duplicates). Return an empty array if none are found.',
            },
            {
              role: 'user',
              content: (truncated ? '(Document truncated to first portion.)\n\n' : '') + text,
            },
          ],
        },
        await this.requestOptions(userId)
      );
      return parseJsonResponse<DuplicatePaymentReport>(completion.choices[0]?.message?.content ?? '');
    });
  }

  async comparePapers(pagesA: PageText[], pagesB: PageText[], userId?: string): Promise<CompareResult> {
    return this.run('COMPARE_PAPERS', userId, async () => {
      const a = buildDocumentText(pagesA);
      const b = buildDocumentText(pagesB);
      const completion = await this.client.chat.completions.create(
        {
          model: await this.modelFor('COMPARE_PAPERS'),
          temperature: 0.2,
          messages: [
            {
              role: 'system',
              content:
                'You compare two academic papers\' methodologies and results. Respond with ONLY a valid ' +
                'JSON object (no markdown fences, no commentary) matching exactly this shape: {"flags":' +
                '[{"excerpt":string,"riskLevel":"low"|"medium"|"high","explanation":string}]}. excerpt must ' +
                'be copied verbatim (a short phrase) from whichever paper it appears in. Use riskLevel to ' +
                'mean "significance of the difference" here (high = a difference that materially affects ' +
                'how the findings should be interpreted). List at most 8 flags.',
            },
            {
              role: 'user',
              content: `PAPER A:\n${a.text}\n\nPAPER B:\n${b.text}`,
            },
          ],
        },
        await this.requestOptions(userId)
      );
      return parseJsonResponse<CompareResult>(completion.choices[0]?.message?.content ?? '');
    });
  }

  async extractMethodology(pages: PageText[], userId?: string): Promise<MethodologyExtract> {
    return this.run('EXTRACT_METHODOLOGY', userId, async () => {
      const { text, truncated } = buildDocumentText(pages);
      const completion = await this.client.chat.completions.create(
        {
          model: await this.modelFor('EXTRACT_METHODOLOGY'),
          temperature: 0.1,
          messages: [
            {
              role: 'system',
              content:
                "You summarize an academic paper's methodology section into a structured table. Respond " +
                'with ONLY a valid JSON object (no markdown fences, no commentary) matching exactly this ' +
                'shape: {"sample":string,"tools":string,"statisticalAnalysis":string}. Each field is a ' +
                'short plain-language summary (1-2 sentences); use "Not specified" if the paper does not ' +
                'cover that aspect.',
            },
            {
              role: 'user',
              content: (truncated ? '(Document truncated to first portion.)\n\n' : '') + text,
            },
          ],
        },
        await this.requestOptions(userId)
      );
      return parseJsonResponse<MethodologyExtract>(completion.choices[0]?.message?.content ?? '');
    });
  }

  async generateOutline(pages: PageText[], userId?: string): Promise<string> {
    return this.run('GENERATE_OUTLINE', userId, async () => {
      const { text, truncated } = buildDocumentText(pages);
      const completion = await this.client.chat.completions.create(
        {
          model: await this.modelFor('GENERATE_OUTLINE'),
          temperature: 0.3,
          messages: [
            {
              role: 'system',
              content:
                'You turn an academic paper into a presentation outline. Respond with plain text only — no ' +
                'markdown, no JSON. Structure it as a series of slide headings, each followed by 2-4 short ' +
                'talking points as a plain list, covering: motivation, methodology, key results, and ' +
                'conclusion at minimum.',
            },
            {
              role: 'user',
              content: (truncated ? '(Document truncated to first portion.)\n\n' : '') + text,
            },
          ],
        },
        await this.requestOptions(userId)
      );
      return completion.choices[0]?.message?.content ?? '';
    });
  }

  // Returns the caller's recent AI activity plus a rolling-30-day count —
  // reads as an audit log for lawyers, usage tracking for researchers.
  async getActivity(userId: string) {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [jobs, monthlyCount] = await Promise.all([
      this.prisma.aiJob.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: { id: true, operation: true, status: true, createdAt: true },
      }),
      this.prisma.aiJob.count({ where: { userId, createdAt: { gte: since } } }),
    ]);
    return { jobs, monthlyCount };
  }

  private async modelFor(operation: AiOperation): Promise<string> {
    if (!LITELLM_PROXY_URL) return DIRECT_MODEL;
    return COMPLEX_OPERATIONS.includes(operation) ? 'task-complex' : 'task-simple';
  }

  // Anonymous/unauthenticated calls (and any call when LiteLLM isn't
  // configured) fall through to the client's default key. Logged-in users
  // get their own LiteLLM virtual key/budget applied via a per-request
  // Authorization override, so usage is capped per customer at the proxy —
  // not just recorded after the fact in our own AiJob audit log.
  private async requestOptions(userId: string | undefined): Promise<{ headers?: Record<string, string> }> {
    if (!LITELLM_PROXY_URL || !userId) return {};
    const virtualKey = await this.liteLlm.getOrCreateVirtualKey(userId);
    if (!virtualKey) return {};
    return { headers: { Authorization: `Bearer ${virtualKey}` } };
  }

  private async run<T>(operation: AiOperation, userId: string | undefined, task: () => Promise<T>): Promise<T> {
    const startedAt = Date.now();
    const job = await this.prisma.aiJob.create({ data: { operation, userId, status: 'PROCESSING' } });
    try {
      const result = await task();
      await this.prisma.aiJob.update({
        where: { id: job.id },
        data: { status: 'SUCCESS', durationMs: Date.now() - startedAt },
      });
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`AI job ${job.id} (${operation}) failed: ${message}`);
      await this.prisma.aiJob.update({
        where: { id: job.id },
        data: { status: 'FAILED', errorMessage: message.slice(0, 2000), durationMs: Date.now() - startedAt },
      });
      throw err;
    }
  }
}
