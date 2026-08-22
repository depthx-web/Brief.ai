import type { MetadataRoute } from 'next';
import { LOCALIZABLE_ROUTES } from '@/lib/i18n/localizableRoutes';
import { LOCALES } from '@/lib/i18n/locales';
import { buildAlternates, localePath, SITE_URL } from '@/lib/i18n/alternates';

// TOOLS_BY_TAB (via localizableRoutes) is the single source of truth for the
// tool list, so a new tool automatically gets a sitemap entry with no
// changes needed here.
export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  for (const path of LOCALIZABLE_ROUTES) {
    const { languages } = buildAlternates(path);
    for (const locale of LOCALES) {
      entries.push({
        url: `${SITE_URL}${localePath(path, locale)}`,
        alternates: { languages },
      });
    }
  }
  return entries;
}
