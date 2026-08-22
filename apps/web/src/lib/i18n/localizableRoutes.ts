import { TOOLS_BY_TAB, type Tab } from '../toolCatalog';

// Every path that gets a locale-prefixed variant (e.g. `/de/pricing`) for
// real hreflang/SEO purposes. Deliberately an allowlist, not "everything
// except X" — authenticated app pages (dashboard/library/wallet/settings/
// workspace/recent/referrals/team, admin, and any auth-callback route) are
// never indexed and never need a second URL per language.
const STATIC_LOCALIZABLE_ROUTES = ['/', '/pricing', '/privacy', '/terms', '/download', '/tools', '/login', '/signup'];

function toolHrefs(): string[] {
  const hrefs = new Set<string>();
  for (const tab of Object.keys(TOOLS_BY_TAB) as Tab[]) {
    for (const tool of TOOLS_BY_TAB[tab]) hrefs.add(tool.href);
  }
  return [...hrefs];
}

export const LOCALIZABLE_ROUTES: readonly string[] = [...STATIC_LOCALIZABLE_ROUTES, ...toolHrefs()];

const LOCALIZABLE_SET = new Set(LOCALIZABLE_ROUTES);

export function isLocalizableRoute(pathname: string): boolean {
  return LOCALIZABLE_SET.has(pathname);
}
