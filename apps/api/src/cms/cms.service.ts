import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Prisma } from '@prisma/client';

// Every individual tool page (route slug -> display name), each getting its
// own `tools-<slug>` CMS page with Features/FAQ sections (SEO template,
// ToolSeoSections.tsx). Kept as its own list since the seed migration
// (20260820150000_tool_page_seo_content) generates matching Page/
// ContentSection rows from this same set of slugs.
const TOOL_PAGE_SLUGS: [string, string][] = [
  ['pdf-to-images', 'PDF to Images'],
  ['images-to-pdf', 'Images to PDF'],
  ['word-to-pdf', 'Word to PDF'],
  ['pdf-to-word', 'PDF to Word'],
  ['excel-to-pdf', 'Excel to PDF'],
  ['pdf-to-excel', 'PDF to Excel'],
  ['powerpoint-to-pdf', 'PowerPoint to PDF'],
  ['pdf-to-powerpoint', 'PDF to PowerPoint'],
  ['pdf-to-text', 'PDF to Text'],
  ['pdf-to-html', 'PDF to Web Page'],
  ['merge', 'Merge'],
  ['split', 'Split'],
  ['organize', 'Organize'],
  ['rotate', 'Rotate'],
  ['page-numbers', 'Page Numbers'],
  ['compress', 'Compress'],
  ['compress-high-ratio', 'Compress (High Ratio)'],
  ['ocr', 'OCR'],
  ['sign', 'Sign'],
  ['protect', 'Protect'],
  ['remove-password', 'Remove Password'],
  ['watermark', 'Watermark'],
  ['batch-invoices', 'Batch Invoice Export'],
  ['contract-compare', 'Contract Compare'],
  ['high-risk-clauses', 'High-Risk Clause Detector'],
  ['plain-summary', 'Plain-Language Summary Generator'],
  ['nda-audit', 'Quick NDA Auditor'],
  ['redaction-detector', 'Auto-Redaction of Sensitive Data'],
  ['duplicate-payments', 'Duplicate Payment Detector'],
  ['financial-ratios', 'Financial Ratio Analyzer'],
  ['bank-reconciliation', 'Bank Reconciliation Assistant'],
  ['tax-deductible', 'Tax-Deductible Expense Flagger'],
  ['multi-paper-compare', 'Multi-Paper Compare'],
  ['methodology-extractor', 'Methodology Extractor'],
  ['presentation-outline', 'Presentation Outline Generator'],
];

// Every CMS-editable page, in the fixed order its sections actually appear
// in on the live site (Part 9 §1.1: "an editor that reflects literally what
// the visitor sees", not an alphabetical or arbitrary list). Adding a page
// here is enough to make it show up in the admin editor — no other backend
// change needed, since getPublished/getDraftForAdmin/publish/discard are all
// slug-generic already.
const CMS_PAGES: { slug: string; label: string; sections: { key: string; label: string }[] }[] = [
  {
    slug: 'home',
    label: 'Home',
    sections: [
      { key: 'hero', label: 'Hero' },
      { key: 'workspaces', label: 'Workspaces' },
      { key: 'trust', label: 'Trust' },
      { key: 'faq', label: 'FAQ' },
    ],
  },
  {
    slug: 'pricing',
    label: 'Pricing',
    sections: [
      { key: 'intro', label: 'Intro' },
      { key: 'faq', label: 'FAQ' },
    ],
  },
  {
    slug: 'privacy',
    label: 'Privacy Policy',
    sections: [{ key: 'body', label: 'Body' }],
  },
  {
    slug: 'terms',
    label: 'Terms of Service',
    sections: [{ key: 'body', label: 'Body' }],
  },
  {
    // Not a real website page — no route renders this slug on the web.
    // Backs the news/promo card on the desktop app's Home screen; reuses
    // this generic page/section machinery for one card rather than a
    // bespoke "announcements" feature. See migration
    // 20260816160000_add_desktop_home_cms.
    slug: 'desktop-home',
    label: 'Desktop App — Home',
    sections: [
      { key: 'announcement_lawyer', label: 'News / promo card — Legal' },
      { key: 'announcement_accountant', label: 'News / promo card — Accounting' },
      { key: 'announcement_researcher', label: 'News / promo card — Research' },
    ],
  },
  ...TOOL_PAGE_SLUGS.map(([slug, label]) => ({
    slug: `tools-${slug}`,
    label: `Tool page — ${label}`,
    sections: [
      { key: 'features', label: 'Features' },
      { key: 'faq', label: 'FAQ' },
    ],
  })),
];

@Injectable()
export class CmsService {
  constructor(private readonly prisma: PrismaService) {}

  listAvailablePages() {
    return CMS_PAGES.map(({ slug, label }) => ({ slug, label }));
  }

  // Public: what the live site actually renders. Falls back to an empty
  // sections map (never null/undefined per section) so a page with nothing
  // published yet doesn't 500 — the frontend's own hardcoded defaults cover it.
  async getPublished(slug: string, preview: boolean) {
    const page = await this.prisma.page.findUnique({
      where: { slug },
      include: { sections: { orderBy: { order: 'asc' } } },
    });
    if (!page) throw new NotFoundException('Page not found.');

    const sections: Record<string, unknown> = {};
    for (const section of page.sections) {
      const fields = preview ? section.draftFields : (section.publishedFields ?? undefined);
      if (fields !== undefined) sections[section.sectionKey] = fields;
    }

    return {
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
      metaKeywords: page.metaKeywords as string[] | null,
      ogImageUrl: page.ogImageUrl,
      sections,
    };
  }

  // Admin: draft state for every section, plus whether each has unpublished
  // changes (draftFields differs from publishedFields) — drives the "Saved
  // as draft" vs "up to date with the live site" indicator per section.
  async getDraftForAdmin(slug: string) {
    const page = await this.findPageWithSections(slug);
    const meta = CMS_PAGES.find((p) => p.slug === slug);
    return {
      slug: page.slug,
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
      metaKeywords: (page.metaKeywords as string[] | null) ?? [],
      ogImageUrl: page.ogImageUrl,
      sections: page.sections.map((s) => ({
        key: s.sectionKey,
        label: meta?.sections.find((m) => m.key === s.sectionKey)?.label ?? s.sectionKey,
        order: s.order,
        fields: s.draftFields,
        hasUnpublishedChanges: JSON.stringify(s.draftFields) !== JSON.stringify(s.publishedFields),
        updatedAt: s.updatedAt,
      })),
    };
  }

  async updateSectionDraft(slug: string, sectionKey: string, fields: Prisma.InputJsonValue) {
    const page = await this.findPageWithSections(slug);
    const section = page.sections.find((s) => s.sectionKey === sectionKey);
    if (!section) throw new NotFoundException('Section not found.');
    await this.prisma.contentSection.update({ where: { id: section.id }, data: { draftFields: fields } });
  }

  async updateSeo(
    slug: string,
    data: { metaTitle?: string; metaDescription?: string; metaKeywords?: string[]; ogImageUrl?: string }
  ) {
    const page = await this.prisma.page.findUnique({ where: { slug } });
    if (!page) throw new NotFoundException('Page not found.');
    return this.prisma.page.update({ where: { slug }, data });
  }

  // Publishes every section on the page at once — the spec's confirmation
  // modal shows "the number of edited fields" before this runs, so partial
  // per-section publish would contradict the single confirmed action.
  async publish(slug: string): Promise<number> {
    const page = await this.findPageWithSections(slug);
    const toPublish = page.sections.filter((s) => JSON.stringify(s.draftFields) !== JSON.stringify(s.publishedFields));
    await Promise.all(
      toPublish.map((s) =>
        this.prisma.contentSection.update({
          where: { id: s.id },
          data: { publishedFields: s.draftFields as Prisma.InputJsonValue },
        })
      )
    );
    return toPublish.length;
  }

  async discardDrafts(slug: string): Promise<void> {
    const page = await this.findPageWithSections(slug);
    await Promise.all(
      page.sections.map((s) =>
        this.prisma.contentSection.update({
          where: { id: s.id },
          data: { draftFields: (s.publishedFields ?? s.draftFields) as Prisma.InputJsonValue },
        })
      )
    );
  }

  private async findPageWithSections(slug: string) {
    const page = await this.prisma.page.findUnique({ where: { slug }, include: { sections: true } });
    if (!page) throw new NotFoundException('Page not found.');
    return page;
  }
}
