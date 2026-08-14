import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const PROXY_URL = process.env.LITELLM_PROXY_URL;
const MASTER_KEY = process.env.LITELLM_MASTER_KEY;

// USD, matching LiteLLM's max_budget unit — a coarse per-account cap so one
// customer can't run up the shared provider bill. This is deliberately not
// plan-dependent: access control (paid-only, or a specific free-plan
// exception) is already enforced one layer up by FeatureGuard/
// RequirePaidPlanGuard before a virtual key is ever requested, so by the
// time we're here the caller is legitimately authorized — gating budget by
// plan again at this layer would silently re-block requests those guards
// already approved (e.g. an admin-enabled free-tier feature).
const BUDGET_USD = 20;

@Injectable()
export class LiteLlmService {
  private readonly logger = new Logger(LiteLlmService.name);

  constructor(private readonly prisma: PrismaService) {}

  isConfigured(): boolean {
    return Boolean(PROXY_URL && MASTER_KEY);
  }

  // Lazily provisions (and caches on the User row) a per-account LiteLLM
  // virtual key + budget, so usage is capped per customer at the proxy
  // itself — not just tracked after the fact in our own AiJob audit log.
  async getOrCreateVirtualKey(userId: string): Promise<string | null> {
    if (!this.isConfigured()) return null;

    const existing = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { liteLlmVirtualKey: true },
    });
    if (existing?.liteLlmVirtualKey) return existing.liteLlmVirtualKey;

    try {
      const response = await fetch(`${PROXY_URL}/key/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${MASTER_KEY}` },
        body: JSON.stringify({
          models: ['task-simple', 'task-complex'],
          max_budget: BUDGET_USD,
          metadata: { userId },
        }),
      });
      if (!response.ok) {
        this.logger.error(`LiteLLM key generation failed: ${response.status} ${await response.text()}`);
        return null;
      }
      const json = (await response.json()) as { key: string };
      await this.prisma.user.update({ where: { id: userId }, data: { liteLlmVirtualKey: json.key } });
      return json.key;
    } catch (err) {
      this.logger.error(
        `LiteLLM key generation request failed: ${err instanceof Error ? err.message : String(err)}`
      );
      return null;
    }
  }
}
