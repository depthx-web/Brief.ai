const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface HomepageStatMetric {
  value: number | null;
  isFallback: boolean;
  fallbackVariant?: 'allCompliant' | 'default';
}

export interface HomepageStatsPayload {
  autoDeletionCompliance: HomepageStatMetric;
  avgProcessingSeconds: HomepageStatMetric;
  clientSideShare: HomepageStatMetric;
  computedAt: string;
}

// Client-side call, always live (no-store) — the value itself is already
// cheap to serve (the API just reads its own periodic cache), so there's
// nothing to gain from also caching it in the browser.
export async function fetchHomepageStats(): Promise<HomepageStatsPayload | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${API_URL}/stats/homepage`, { signal: controller.signal, cache: 'no-store' });
    clearTimeout(timeout);
    if (!res.ok) return null;
    return (await res.json()) as HomepageStatsPayload;
  } catch {
    return null;
  }
}

// Fire-and-forget: called after a client-side tool (merge, split, rotate,
// etc. — anything that never hits the API for the actual file work) finishes
// successfully, purely so the homepage's "client-side share" trust metric
// has real data. No file content or identity is sent, and a failure here
// must never surface to the user — it's just a counter.
export function recordClientOperation(tool: string): void {
  try {
    void fetch(`${API_URL}/stats/client-operation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // ignore
  }
}
