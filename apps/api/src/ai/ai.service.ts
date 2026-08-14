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
const COMPLEX_OPERATIONS: AiOperation[] = ['ANALYZE_CLAUSES', 'CHAT'];

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
