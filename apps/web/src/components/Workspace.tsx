'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import * as pdfjsLib from 'pdfjs-dist';
import * as Diff from 'diff';
import { useAuth } from '@/lib/AuthContext';
import { useLocale } from '@/lib/i18n/LocaleContext';
import { extractPdfText, type PageText } from '@/lib/extractPdfText';
import { fetchDocumentFile, deleteDocument, downloadDocument, listDocuments } from '@/lib/libraryApi';
import {
  summarizeDocument,
  analyzeClauses,
  extractReferences,
  extractInvoiceData,
  askDocument,
  type ClauseAnalysis,
  type InvoiceData,
  type ChatMessage,
} from '@/lib/aiApi';
import MiniFileCard from './MiniFileCard';

interface DisplayMessage extends ChatMessage {
  file?: { title: string; filename: string; content: string };
}

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

type Tab = 'analysis' | 'chat';

async function renderPageImages(file: File): Promise<string[]> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdfDoc = await pdfjsLib.getDocument({ data: bytes.slice() }).promise;
  const images: string[] = [];
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: 150 / 72 });
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;
    await page.render({ canvasContext: ctx, viewport }).promise;
    images.push(canvas.toDataURL('image/png'));
  }
  await pdfDoc.destroy();
  return images;
}

function joinPages(pages: PageText[]): string {
  return pages.map((p) => p.text).join('\n\n');
}

export default function Workspace() {
  const { user, token } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const docId = searchParams.get('doc');

  const [filename, setFilename] = useState('');
  const [docType, setDocType] = useState<string | undefined>(undefined);
  const [pages, setPages] = useState<PageText[] | null>(null);
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [isLoadingDoc, setIsLoadingDoc] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [tab, setTab] = useState<Tab>('analysis');

  const [clauseAnalysis, setClauseAnalysis] = useState<ClauseAnalysis | null>(null);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [references, setReferences] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Available regardless of segment — the segment-specific analysis above
  // doesn't replace the general "just summarize this" capability.
  const [showQuickSummary, setShowQuickSummary] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const [diffParts, setDiffParts] = useState<Diff.Change[] | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const compareInputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [question, setQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  useEffect(() => {
    if (!token || !docId) {
      setIsLoadingDoc(false);
      return;
    }
    let cancelled = false;

    async function load() {
      setIsLoadingDoc(true);
      setLoadError(null);
      try {
        const [file, docs] = await Promise.all([
          fetchDocumentFile(token!, docId!),
          listDocuments(token!).catch(() => []),
        ]);
        if (cancelled) return;
        setFilename(file.name);
        const foundDocType = docs.find((d) => d.id === docId)?.docType ?? undefined;
        setDocType(foundDocType);
        const extracted = await extractPdfText(file);
        if (cancelled) return;
        setPages(extracted);
        renderPageImages(file).then((images) => !cancelled && setPageImages(images));
        runAnalysis(extracted, foundDocType);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : t('docWorkspace.couldNotLoad'));
        }
      } finally {
        if (!cancelled) setIsLoadingDoc(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, docId]);

  async function runAnalysis(docPages: PageText[], forDocType?: string) {
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      if (user?.segment === 'LAWYER') {
        setClauseAnalysis(await analyzeClauses(docPages, token ?? undefined, forDocType));
      } else if (user?.segment === 'ACCOUNTANT') {
        setInvoiceData(await extractInvoiceData(docPages, token ?? undefined, forDocType));
      } else if (user?.segment === 'RESEARCHER') {
        setReferences(await extractReferences(docPages, 'bibtex', token ?? undefined, forDocType));
      } else {
        setSummary(await summarizeDocument(docPages, 'executive', 'medium', token ?? undefined, forDocType));
      }
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : t('docWorkspace.couldNotAnalyze'));
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handleQuickSummary() {
    if (!pages) return;
    setShowQuickSummary(true);
    setIsSummarizing(true);
    setAnalysisError(null);
    try {
      setSummary(await summarizeDocument(pages, 'executive', 'medium', token ?? undefined, docType));
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : t('docWorkspace.couldNotSummarize'));
    } finally {
      setIsSummarizing(false);
    }
  }

  async function handleCompare(file: File) {
    if (!pages) return;
    setIsComparing(true);
    setAnalysisError(null);
    try {
      const otherPages = await extractPdfText(file);
      setDiffParts(Diff.diffWords(joinPages(pages), joinPages(otherPages)));
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : t('docWorkspace.couldNotCompareDocuments'));
    } finally {
      setIsComparing(false);
    }
  }

  async function handleSend() {
    const trimmed = question.trim();
    if (!pages || !trimmed) return;
    const next: DisplayMessage[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(next);
    setQuestion('');
    setIsAsking(true);
    try {
      // History sent back to the model is plain {role, content} — the file
      // envelope is a display-only concern, not something it should see
      // reflected back at it as prior conversation turns.
      const history: ChatMessage[] = messages.map((m) => ({ role: m.role, content: m.content }));
      const result = await askDocument(pages, history, trimmed, token ?? undefined, docType);
      const reply: DisplayMessage =
        result.type === 'file'
          ? {
              role: 'assistant',
              content: t('docWorkspace.generatedPrefix').replace('{title}', result.title),
              file: { title: result.title, filename: result.filename, content: result.content },
            }
          : { role: 'assistant', content: result.content };
      setMessages([...next, reply]);
    } catch (err) {
      setMessages(messages);
      setAnalysisError(err instanceof Error ? err.message : t('docWorkspace.couldNotGetAnswer'));
    } finally {
      setIsAsking(false);
    }
  }

  async function handleDelete() {
    if (!token || !docId) return;
    if (!window.confirm(t('docWorkspace.confirmDelete'))) return;
    await deleteDocument(token, docId);
    router.push('/library');
  }

  async function handleDownload() {
    if (!token || !docId) return;
    await downloadDocument(token, docId, filename);
  }

  if (!docId) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="text-ink-soft">{t('docWorkspace.noDocumentSelected')}</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="mt-4 font-medium text-navy hover:text-emerald"
        >
          {t('nav.goToDashboard')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="flex h-12 items-center justify-between border-b border-[#E4E8ED] bg-white px-5">
        <div className="flex min-w-0 items-center gap-3.5">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-ink-soft hover:text-navy"
            aria-label={t('docWorkspace.back')}
            title={t('docWorkspace.back')}
          >
            <BackIcon />
          </button>
          <span className="truncate font-mono text-[13px] text-ink">{filename || t('common.loading')}</span>
          {docType && (
            <span className="shrink-0 rounded-full bg-emerald-soft px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald">
              {docType}
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={handleDownload}
            className="flex h-7 w-7 items-center justify-center rounded-md text-ink-soft hover:text-navy"
            aria-label={t('common.download')}
            title={t('common.download')}
          >
            <DownloadIcon />
          </button>
          <button
            onClick={handleDelete}
            className="flex h-7 w-7 items-center justify-center rounded-md text-ink-soft hover:text-redline"
            aria-label={t('common.delete')}
            title={t('common.delete')}
          >
            <DeleteIcon />
          </button>
        </div>
      </div>

      {loadError && (
        <p className="border-b border-gray-200 bg-red-50 px-5 py-2 text-sm text-redline">
          {loadError}
        </p>
      )}

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-[6] overflow-y-auto bg-gray-100 p-8">
          {isLoadingDoc ? (
            <p className="text-center text-sm text-ink-soft">{t('docWorkspace.loadingDocument')}</p>
          ) : (
            <div className="mx-auto flex max-w-2xl flex-col items-center gap-4">
              {pageImages.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={src} alt={`Page ${i + 1}`} className="w-full rounded shadow-md" />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-[4] flex-col border-l border-gray-200 bg-white">
          <div className="flex border-b border-gray-200">
            {(['analysis', 'chat'] as Tab[]).map((tabKey) => (
              <button
                key={tabKey}
                onClick={() => setTab(tabKey)}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  tab === tabKey ? 'border-b-2 border-emerald text-navy' : 'text-ink-soft hover:text-navy'
                }`}
              >
                {t(tabKey === 'analysis' ? 'docWorkspace.tabAnalysis' : 'docWorkspace.tabChat')}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {analysisError && <p className="mb-4 text-sm text-redline">{analysisError}</p>}

            {tab === 'analysis' && (
              <>
                {user?.segment && (
                  <div className="mb-5 border-b border-gray-100 pb-5">
                    <button
                      onClick={() => (showQuickSummary ? setShowQuickSummary(false) : handleQuickSummary())}
                      className="text-sm font-medium text-navy hover:text-emerald"
                    >
                      {showQuickSummary ? t('docWorkspace.hideQuickSummary') : t('docWorkspace.getQuickSummary')}
                    </button>
                    {showQuickSummary && (
                      <p className="mt-3 whitespace-pre-wrap text-sm text-ink-soft">
                        {isSummarizing ? t('docWorkspace.summarizing') : summary}
                      </p>
                    )}
                  </div>
                )}
                {isAnalyzing ? (
                  <div className="space-y-3">
                    <p className="font-mono text-xs text-ink-soft">{t('docWorkspace.analyzing')}</p>
                    <div className="h-3 animate-pulse rounded bg-gray-200" />
                    <div className="h-3 w-5/6 animate-pulse rounded bg-gray-200" />
                    <div className="h-3 w-4/6 animate-pulse rounded bg-gray-200" />
                  </div>
                ) : (
                  <>
                    {clauseAnalysis && (
                      <div className="space-y-5">
                        {clauseAnalysis.clauses.length > 0 ? (
                          <ul className="space-y-3">
                            {clauseAnalysis.clauses.map((c, i) => (
                              <li key={i} className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm">
                                <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-800">
                                  {c.category}
                                </span>
                                <p className="mt-2 italic text-ink-soft">&ldquo;{c.excerpt}&rdquo;</p>
                                <p className="mt-1 text-ink-soft">{c.explanation}</p>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-ink-soft">{t('aiTool.highRiskClauses.noneFound')}</p>
                        )}

                        <dl className="space-y-3 text-sm">
                          {(['parties', 'dates', 'amounts', 'obligations'] as const).map((key) => (
                            <div key={key}>
                              <dt className="font-medium text-ink">{t(`aiTool.highRiskClauses.${key}`)}</dt>
                              <dd className="text-ink-soft">
                                {clauseAnalysis.entities[key].length > 0
                                  ? clauseAnalysis.entities[key].join(', ')
                                  : '—'}
                              </dd>
                            </div>
                          ))}
                        </dl>

                        <div className="border-t border-gray-100 pt-4">
                          <button
                            onClick={() => setShowCompare((v) => !v)}
                            className="text-sm font-medium text-navy hover:text-emerald"
                          >
                            {showCompare ? t('docWorkspace.hideComparison') : t('docWorkspace.compareAnotherVersion')}
                          </button>
                          {showCompare && (
                            <div className="mt-3">
                              <button
                                onClick={() => compareInputRef.current?.click()}
                                disabled={isComparing}
                                className="rounded-md border border-gray-300 px-3 py-2 text-xs hover:bg-gray-50"
                              >
                                {isComparing ? t('toolPage.contractCompare.comparing') : t('docWorkspace.chooseFileToCompare')}
                              </button>
                              <input
                                ref={compareInputRef}
                                type="file"
                                accept="application/pdf"
                                className="hidden"
                                onChange={(e) => e.target.files?.[0] && handleCompare(e.target.files[0])}
                              />
                              {diffParts && (
                                <p className="mt-3 whitespace-pre-wrap break-words text-xs leading-relaxed">
                                  {diffParts.map((part, i) => (
                                    <span
                                      key={i}
                                      className={
                                        part.added
                                          ? 'bg-emerald/20 text-emerald-dark'
                                          : part.removed
                                            ? 'bg-red-100 text-redline line-through'
                                            : 'text-ink-soft'
                                      }
                                    >
                                      {part.value}
                                    </span>
                                  ))}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {invoiceData && (
                      <dl className="space-y-3 text-sm">
                        <div>
                          <dt className="font-medium text-ink">{t('toolPage.batchInvoices.colVendor')}</dt>
                          <dd className="text-ink-soft">{invoiceData.vendor || '—'}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-ink">{t('toolPage.batchInvoices.colInvoiceNumber')}</dt>
                          <dd className="font-mono text-ink-soft">{invoiceData.invoiceNumber || '—'}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-ink">{t('toolPage.batchInvoices.colDate')}</dt>
                          <dd className="text-ink-soft">{invoiceData.date || '—'}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-ink">{t('toolPage.batchInvoices.colCategory')}</dt>
                          <dd className="text-ink-soft">{invoiceData.category || '—'}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-ink">{t('toolPage.batchInvoices.colTotal')}</dt>
                          <dd className="font-mono text-ink-soft">{invoiceData.total || '—'}</dd>
                        </div>
                        {invoiceData.lineItems.length > 0 && (
                          <div>
                            <dt className="mb-1 font-medium text-ink">{t('docWorkspace.lineItems')}</dt>
                            <ul className="space-y-1 text-xs text-ink-soft">
                              {invoiceData.lineItems.map((li, i) => (
                                <li key={i}>
                                  {li.description} — {li.quantity} × {li.unitPrice} = {li.amount}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </dl>
                    )}

                    {references && (
                      <pre className="whitespace-pre-wrap break-words font-mono text-xs text-ink-soft">
                        {references}
                      </pre>
                    )}

                    {summary && <p className="whitespace-pre-wrap text-sm text-ink-soft">{summary}</p>}
                  </>
                )}
              </>
            )}

            {tab === 'chat' && (
              <div className="flex h-full flex-col">
                <div className="flex-1 space-y-3 overflow-y-auto">
                  {messages.length === 0 && (
                    <p className="text-sm text-ink-soft">{t('docWorkspace.askAQuestion')}</p>
                  )}
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {m.file ? (
                        <div className="rounded-lg border border-gray-200 bg-white p-2">
                          <MiniFileCard title={m.file.title} filename={m.file.filename} content={m.file.content} />
                        </div>
                      ) : (
                        <p
                          className={`max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm ${
                            m.role === 'user'
                              ? 'bg-navy-light/10 text-ink'
                              : 'border border-gray-200 bg-white text-ink'
                          }`}
                        >
                          {m.content}
                        </p>
                      )}
                    </div>
                  ))}
                  {isAsking && <p className="text-sm text-ink-soft">{t('docWorkspace.thinking')}</p>}
                </div>
                <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !isAsking && handleSend()}
                    placeholder={t('docWorkspace.askPlaceholder')}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                  <button
                    onClick={handleSend}
                    disabled={isAsking || !question.trim()}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald text-white hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
                    aria-label={t('docWorkspace.send')}
                  >
                    →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BackIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}
function DownloadIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12M12 15l-4-4M12 15l4-4" />
      <path d="M5 17v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}
function DeleteIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13" />
    </svg>
  );
}
