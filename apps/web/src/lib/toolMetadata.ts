import type { Metadata } from 'next';
import { TOOLS_BY_TAB, type Tab, type Tool } from './toolCatalog';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

function findTool(slug: string): Tool | null {
  for (const tab of Object.keys(TOOLS_BY_TAB) as Tab[]) {
    const tool = TOOLS_BY_TAB[tab].find((t) => t.href === `/${slug}`);
    if (tool) return tool;
  }
  return null;
}

// Shared by every individual tool page's generateMetadata() — CMS SEO
// fields (Page slug `tools-<slug>`) override these plain per-tool defaults
// built from the same name/description already shown in the tools catalog,
// exactly like ToolSeoSections falls back to TOOL_SEO_CONTENT below the fold.
//
// Deliberately does NOT go through cmsApi's fetchCmsPage: that helper uses
// cache:'no-cache' for a normal web build (only desktop's static export gets
// force-cache), which is right for ToolSeoSections' always-fresh runtime
// fetch but would force every one of these 35 pages into per-request dynamic
// rendering just to read a title/description — a real perf/cost regression
// for content an admin edit only needs to reach on the next deploy anyway.
export async function getToolMetadata(slug: string): Promise<Metadata> {
  const tool = findTool(slug);
  const defaultTitle = tool ? `${tool.name} — Dossiera` : 'Dossiera — PDF Tools';
  const defaultDescription = tool?.description ?? 'Professional PDF tools with AI-powered document intelligence.';

  let page: { metaTitle: string | null; metaDescription: string | null; ogImageUrl: string | null } | null = null;
  try {
    const res = await fetch(`${API_URL}/cms/pages/tools-${slug}`, { cache: 'force-cache' });
    if (res.ok) page = await res.json();
  } catch {
    // CMS unreachable at build time — fall back to the plain defaults below.
  }

  return {
    title: page?.metaTitle || defaultTitle,
    description: page?.metaDescription || defaultDescription,
    ...(page?.ogImageUrl ? { openGraph: { images: [page.ogImageUrl] } } : {}),
  };
}
