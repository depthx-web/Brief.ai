'use client';

import { useEffect, useRef, useState } from 'react';
import { useAdminAuth } from '@/lib/AdminAuthContext';
import {
  fetchAdminCmsPages,
  fetchAdminCmsPageDraft,
  updateAdminCmsSection,
  updateAdminCmsSeo,
  publishAdminCmsPage,
  discardAdminCmsDrafts,
  type AdminCmsPageSummary,
  type AdminCmsPageDraft,
} from '@/lib/adminApi';
import { showError, showSuccess } from '@/lib/toast';

interface HeroFields {
  eyebrow: string;
  headingLine1: string;
  headingLine2: string;
  subtext: string;
}

interface WorkspaceItem {
  eyebrow: string;
  title: string;
  description: string;
  features: string[];
}

interface TrustFields {
  heading: string;
}

interface IntroFields {
  heading: string;
}

interface LegalSectionItem {
  title: string;
  body: string;
}

interface FaqItem {
  q: string;
  a: string;
}

interface AnnouncementFields {
  badge: string;
  kicker: string;
  headline: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
}

const PREVIEW_ORIGIN = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

// Maps a CMS slug to the public route that actually renders it — "home" is
// the root path, every other page's slug matches its route 1:1.
const PAGE_PATH: Record<string, string> = { home: '/' };
function pathForSlug(slug: string): string {
  return PAGE_PATH[slug] ?? `/${slug}`;
}

// The desktop-home preview otherwise shows whichever segment's announcement
// the admin's own logged-in account happens to be — pass along which
// section's accordion is actually open so the pane matches what's being
// edited instead.
function previewSegmentParam(openSection: string | null): string {
  if (!openSection?.startsWith('announcement_')) return '';
  return `&previewSegment=${openSection.slice('announcement_'.length)}`;
}

export default function AdminCms() {
  const { token } = useAdminAuth();
  const [pages, setPages] = useState<AdminCmsPageSummary[]>([]);
  const [slug, setSlug] = useState<string>('home');
  const [draft, setDraft] = useState<AdminCmsPageDraft | null>(null);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [previewNonce, setPreviewNonce] = useState(0);
  const [publishOpen, setPublishOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slugRef = useRef(slug);
  slugRef.current = slug;

  useEffect(() => {
    if (!token) return;
    fetchAdminCmsPages(token).then(setPages).catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!token) return;
    // Clear the previous page's draft immediately (not just after the new
    // fetch resolves) — otherwise the SEO fields below remount on the new
    // slug's key while `draft` still holds the old page's data for one
    // render, capturing that stale value as their initial state forever
    // (useState's initializer only runs once, on mount).
    setDraft(null);
    load(token, slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, slug]);

  // Guards against a stale response landing after a newer request — e.g.
  // switching the page dropdown quickly enough that the previous page's
  // fetch resolves after the new one and would otherwise overwrite it.
  function load(currentToken: string, currentSlug: string) {
    fetchAdminCmsPageDraft(currentToken, currentSlug)
      .then((data) => {
        if (currentSlug === slugRef.current) setDraft(data);
      })
      .catch((err) => showError(err instanceof Error ? err.message : 'Could not load this page.'));
  }

  function schedulePreviewRefresh() {
    setPreviewNonce((n) => n + 1);
  }

  async function saveSection(key: string, fields: unknown) {
    if (!token) return;
    setDraft((prev) => (prev ? { ...prev, sections: prev.sections.map((s) => (s.key === key ? { ...s, fields, hasUnpublishedChanges: true } : s)) } : prev));
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSavingKey(key);
    debounceRef.current = setTimeout(async () => {
      try {
        await updateAdminCmsSection(token, slug, key, fields);
        schedulePreviewRefresh();
      } catch (err) {
        showError(err instanceof Error ? err.message : 'Could not save this section.');
      } finally {
        setSavingKey(null);
      }
    }, 500);
  }

  async function handleSeoBlur(field: 'metaTitle' | 'metaDescription' | 'ogImageUrl', value: string) {
    if (!token || !draft) return;
    try {
      await updateAdminCmsSeo(token, slug, { [field]: value });
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Could not save SEO settings.');
    }
  }

  async function handlePublish() {
    if (!token) return;
    setIsPublishing(true);
    try {
      const { publishedCount } = await publishAdminCmsPage(token, slug);
      showSuccess(publishedCount > 0 ? `Published ${publishedCount} section${publishedCount === 1 ? '' : 's'}` : 'Nothing to publish');
      setPublishOpen(false);
      load(token, slug);
      schedulePreviewRefresh();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Could not publish.');
    } finally {
      setIsPublishing(false);
    }
  }

  async function handleDiscard() {
    if (!token) return;
    try {
      await discardAdminCmsDrafts(token, slug);
      load(token, slug);
      schedulePreviewRefresh();
      showSuccess('Draft changes discarded');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Could not discard drafts.');
    }
  }

  const unpublishedCount = draft?.sections.filter((s) => s.hasUnpublishedChanges).length ?? 0;

  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-medium text-navy">Site Content</h1>
        <select
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          {pages.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {!draft ? (
        <p className="mt-8 text-sm text-ink-soft">Loading…</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[420px_1fr]">
          <div>
            {/* SEO Settings — fixed, non-collapsible, always visible above the sections */}
            <div className="rounded-lg border border-emerald/20 bg-emerald-soft/[0.08] p-4">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-soft">SEO Settings</h2>
              <div className="mt-3 space-y-3">
                <SeoField
                  key={`${slug}-metaTitle`}
                  label="Page title (Meta Title)"
                  defaultValue={draft.metaTitle ?? ''}
                  maxLength={60}
                  onBlur={(v) => handleSeoBlur('metaTitle', v)}
                />
                <SeoField
                  key={`${slug}-metaDescription`}
                  label="Description (Meta Description)"
                  defaultValue={draft.metaDescription ?? ''}
                  maxLength={160}
                  multiline
                  onBlur={(v) => handleSeoBlur('metaDescription', v)}
                />
                <SeoField
                  key={`${slug}-ogImageUrl`}
                  label="Share image URL (OG Image)"
                  defaultValue={draft.ogImageUrl ?? ''}
                  onBlur={(v) => handleSeoBlur('ogImageUrl', v)}
                />
              </div>
            </div>

            {/* Section accordion, in the order they actually appear on the page */}
            <div className="mt-4 space-y-2">
              {draft.sections.map((section) => {
                const isOpen = openSection === section.key;
                return (
                  <div key={section.key} className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                    <button
                      onClick={() => setOpenSection(isOpen ? null : section.key)}
                      className="flex w-full items-center justify-between px-4 py-3 text-left"
                    >
                      <span className="font-medium text-ink">{section.label}</span>
                      <span className="flex items-center gap-2 text-xs text-ink-soft">
                        {savingKey === section.key ? (
                          <span className="font-mono text-ink-soft">Saving…</span>
                        ) : section.hasUnpublishedChanges ? (
                          <span className="font-mono text-amber-600">Saved as draft</span>
                        ) : (
                          <span className="font-mono text-emerald">Up to date</span>
                        )}
                        <span>{isOpen ? '−' : '+'}</span>
                      </span>
                    </button>
                    {isOpen && (
                      <div className="border-t border-gray-100 px-4 py-4">
                        <SectionEditor
                          sectionKey={section.key}
                          fields={section.fields}
                          onChange={(fields) => saveSection(section.key, fields)}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => setPublishOpen(true)}
                disabled={unpublishedCount === 0}
                className="rounded-lg bg-emerald px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                Publish changes
              </button>
              <button
                onClick={handleDiscard}
                disabled={unpublishedCount === 0}
                className="rounded-lg border border-redline px-5 py-2.5 text-sm font-medium text-redline transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Discard all draft changes
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Live preview (draft)</p>
              <button onClick={schedulePreviewRefresh} className="text-xs font-medium text-emerald hover:underline">
                Refresh
              </button>
            </div>
            <div className="mt-2 overflow-hidden rounded-lg border border-gray-200" style={{ height: '75vh' }}>
              <iframe
                key={previewNonce}
                src={`${PREVIEW_ORIGIN}${pathForSlug(slug)}?cmsPreview=1&_r=${previewNonce}${previewSegmentParam(openSection)}`}
                className="h-full w-full"
                title="Live preview"
              />
            </div>
          </div>
        </div>
      )}

      {publishOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,35,64,0.6)]">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="font-serif text-lg font-semibold text-navy">Publish changes?</h2>
            <p className="mt-2 text-sm text-ink-soft">
              This publishes {unpublishedCount} edited section{unpublishedCount === 1 ? '' : 's'} to the live site.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setPublishOpen(false)} className="text-sm font-medium text-ink-soft hover:text-ink">
                Cancel
              </button>
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="rounded-lg bg-emerald px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPublishing ? 'Publishing…' : 'Publish now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SeoField({
  label,
  defaultValue,
  maxLength,
  multiline,
  onBlur,
}: {
  label: string;
  defaultValue: string;
  maxLength?: number;
  multiline?: boolean;
  onBlur: (value: string) => void;
}) {
  const [value, setValue] = useState(defaultValue);
  const overLimit = maxLength ? value.length > maxLength : false;

  return (
    <div>
      <label className="block text-xs font-medium text-ink">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => onBlur(value)}
          rows={3}
          className="mt-1 w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => onBlur(value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm"
        />
      )}
      {maxLength && (
        <p className={`mt-0.5 text-right font-mono text-[10px] ${overLimit ? 'text-redline' : value.length > maxLength * 0.85 ? 'text-amber-600' : 'text-ink-soft'}`}>
          {value.length}/{maxLength}
        </p>
      )}
    </div>
  );
}

function SectionEditor({
  sectionKey,
  fields,
  onChange,
}: {
  sectionKey: string;
  fields: unknown;
  onChange: (fields: unknown) => void;
}) {
  if (sectionKey === 'hero') return <HeroEditor fields={fields as HeroFields} onChange={onChange} />;
  if (sectionKey === 'trust') return <TrustEditor fields={fields as TrustFields} onChange={onChange} />;
  if (sectionKey === 'intro') return <IntroEditor fields={fields as IntroFields} onChange={onChange} />;
  if (sectionKey === 'workspaces') return <WorkspacesEditor fields={fields as { items: WorkspaceItem[] }} onChange={onChange} />;
  if (sectionKey === 'faq') return <FaqEditor fields={fields as { items: FaqItem[] }} onChange={onChange} />;
  if (sectionKey === 'body') return <LegalSectionsEditor fields={fields as { items: LegalSectionItem[] }} onChange={onChange} />;
  if (sectionKey.startsWith('announcement')) return <AnnouncementEditor fields={fields as AnnouncementFields} onChange={onChange} />;
  return <p className="text-sm text-ink-soft">No editor available for this section yet.</p>;
}

function TextField({ label, value, onChange, multiline }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-medium text-ink">{label}</label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="mt-1 w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm" />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm" />
      )}
    </div>
  );
}

function HeroEditor({ fields, onChange }: { fields: HeroFields; onChange: (f: HeroFields) => void }) {
  return (
    <div className="space-y-3">
      <TextField label="Eyebrow" value={fields.eyebrow} onChange={(v) => onChange({ ...fields, eyebrow: v })} />
      <TextField label="Heading — line 1" value={fields.headingLine1} onChange={(v) => onChange({ ...fields, headingLine1: v })} />
      <TextField label="Heading — line 2 (emphasized)" value={fields.headingLine2} onChange={(v) => onChange({ ...fields, headingLine2: v })} />
      <TextField label="Subtext" value={fields.subtext} onChange={(v) => onChange({ ...fields, subtext: v })} multiline />
    </div>
  );
}

function AnnouncementEditor({ fields, onChange }: { fields: AnnouncementFields; onChange: (f: AnnouncementFields) => void }) {
  return (
    <div className="space-y-3">
      <TextField label="Badge (e.g. New)" value={fields.badge} onChange={(v) => onChange({ ...fields, badge: v })} />
      <TextField label="Kicker" value={fields.kicker} onChange={(v) => onChange({ ...fields, kicker: v })} />
      <TextField label="Headline" value={fields.headline} onChange={(v) => onChange({ ...fields, headline: v })} />
      <TextField label="Body" value={fields.body} onChange={(v) => onChange({ ...fields, body: v })} multiline />
      <TextField label="CTA label" value={fields.ctaLabel} onChange={(v) => onChange({ ...fields, ctaLabel: v })} />
      <TextField label="CTA link (e.g. /contract-compare)" value={fields.ctaHref} onChange={(v) => onChange({ ...fields, ctaHref: v })} />
    </div>
  );
}

function TrustEditor({ fields, onChange }: { fields: TrustFields; onChange: (f: TrustFields) => void }) {
  return <TextField label="Heading" value={fields.heading} onChange={(v) => onChange({ heading: v })} />;
}

function IntroEditor({ fields, onChange }: { fields: IntroFields; onChange: (f: IntroFields) => void }) {
  return <TextField label="Heading" value={fields.heading} onChange={(v) => onChange({ heading: v })} />;
}

function WorkspacesEditor({ fields, onChange }: { fields: { items: WorkspaceItem[] }; onChange: (f: { items: WorkspaceItem[] }) => void }) {
  function updateItem(index: number, item: WorkspaceItem) {
    const items = [...fields.items];
    items[index] = item;
    onChange({ items });
  }

  return (
    <div className="space-y-5">
      {fields.items.map((item, i) => (
        <div key={i} className="rounded-md border border-gray-100 p-3">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-wide text-ink-soft">Card {i + 1}</p>
          <div className="space-y-2">
            <TextField label="Eyebrow" value={item.eyebrow} onChange={(v) => updateItem(i, { ...item, eyebrow: v })} />
            <TextField label="Title" value={item.title} onChange={(v) => updateItem(i, { ...item, title: v })} />
            <TextField label="Description" value={item.description} onChange={(v) => updateItem(i, { ...item, description: v })} multiline />
            <div>
              <label className="block text-xs font-medium text-ink">Features (one per line)</label>
              <textarea
                value={item.features.join('\n')}
                onChange={(e) => updateItem(i, { ...item, features: e.target.value.split('\n') })}
                rows={3}
                className="mt-1 w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FaqEditor({ fields, onChange }: { fields: { items: FaqItem[] }; onChange: (f: { items: FaqItem[] }) => void }) {
  function updateItem(index: number, item: FaqItem) {
    const items = [...fields.items];
    items[index] = item;
    onChange({ items });
  }

  function removeItem(index: number) {
    onChange({ items: fields.items.filter((_, i) => i !== index) });
  }

  function addItem() {
    onChange({ items: [...fields.items, { q: 'New question', a: 'New answer' }] });
  }

  return (
    <div className="space-y-4">
      {fields.items.map((item, i) => (
        <div key={i} className="rounded-md border border-gray-100 p-3">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-wide text-ink-soft">Question {i + 1}</p>
            <button onClick={() => removeItem(i)} className="text-[11px] font-medium text-redline hover:underline">
              Remove
            </button>
          </div>
          <div className="mt-2 space-y-2">
            <TextField label="Question" value={item.q} onChange={(v) => updateItem(i, { ...item, q: v })} />
            <TextField label="Answer" value={item.a} onChange={(v) => updateItem(i, { ...item, a: v })} multiline />
          </div>
        </div>
      ))}
      <button onClick={addItem} className="text-sm font-medium text-emerald hover:underline">
        + Add item
      </button>
    </div>
  );
}

function LegalSectionsEditor({
  fields,
  onChange,
}: {
  fields: { items: LegalSectionItem[] };
  onChange: (f: { items: LegalSectionItem[] }) => void;
}) {
  function updateItem(index: number, item: LegalSectionItem) {
    const items = [...fields.items];
    items[index] = item;
    onChange({ items });
  }

  function removeItem(index: number) {
    onChange({ items: fields.items.filter((_, i) => i !== index) });
  }

  function addItem() {
    onChange({ items: [...fields.items, { title: 'New section', body: '' }] });
  }

  return (
    <div className="space-y-4">
      {fields.items.map((item, i) => (
        <div key={i} className="rounded-md border border-gray-100 p-3">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-wide text-ink-soft">Section {i + 1}</p>
            <button onClick={() => removeItem(i)} className="text-[11px] font-medium text-redline hover:underline">
              Remove
            </button>
          </div>
          <div className="mt-2 space-y-2">
            <TextField label="Title" value={item.title} onChange={(v) => updateItem(i, { ...item, title: v })} />
            <div>
              <label className="block text-xs font-medium text-ink">Body (blank line = new paragraph)</label>
              <textarea
                value={item.body}
                onChange={(e) => updateItem(i, { ...item, body: e.target.value })}
                rows={5}
                className="mt-1 w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm"
              />
            </div>
          </div>
        </div>
      ))}
      <button onClick={addItem} className="text-sm font-medium text-emerald hover:underline">
        + Add section
      </button>
    </div>
  );
}
