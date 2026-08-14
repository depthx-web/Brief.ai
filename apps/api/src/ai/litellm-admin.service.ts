import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

const PROXY_URL = process.env.LITELLM_PROXY_URL;
const MASTER_KEY = process.env.LITELLM_MASTER_KEY;

export type TaskAlias = 'task-simple' | 'task-complex';
const TASK_ALIASES: TaskAlias[] = ['task-simple', 'task-complex'];

interface ModelEntry {
  id: string;
  model_name: string;
  model: string;
}

export interface ProviderStatus {
  name: string;
  envVar: string;
  configured: boolean;
  maskedKey: string | null;
}

export interface RoutingRule {
  alias: TaskAlias;
  model: string;
  id: string | null;
}

export interface ModelChoice {
  model: string;
  label: string;
  envVar: string;
}

const PROVIDERS: { name: string; envVar: string }[] = [
  { name: 'DeepSeek', envVar: 'LLM_API_KEY' },
  { name: 'Gemini', envVar: 'GEMINI_API_KEY' },
  { name: 'Claude', envVar: 'ANTHROPIC_API_KEY' },
  { name: 'OpenAI', envVar: 'OPENAI_API_KEY' },
];

// Default backing model per alias (seeded on first boot) plus the swap-in
// choices offered from the admin panel once the matching provider key is set.
const MODEL_CHOICES: ModelChoice[] = [
  { model: 'deepseek/deepseek-chat', label: 'DeepSeek Chat', envVar: 'LLM_API_KEY' },
  { model: 'gemini/gemini-flash-lite-latest', label: 'Gemini Flash-Lite', envVar: 'GEMINI_API_KEY' },
  { model: 'gemini/gemini-2.0-flash', label: 'Gemini 2.0 Flash', envVar: 'GEMINI_API_KEY' },
  { model: 'claude-3-5-sonnet-latest', label: 'Claude 3.5 Sonnet', envVar: 'ANTHROPIC_API_KEY' },
  { model: 'gpt-4o-mini', label: 'GPT-4o mini', envVar: 'OPENAI_API_KEY' },
  { model: 'gpt-4o', label: 'GPT-4o', envVar: 'OPENAI_API_KEY' },
];

function maskKey(value: string): string {
  if (value.length <= 8) return '••••••••';
  return `${value.slice(0, 3)}${'•'.repeat(6)}${value.slice(-4)}`;
}

// Manages the LiteLLM proxy's task-simple/task-complex model routing live,
// via its /model/* management API (STORE_MODEL_IN_DB=True backs this with
// the litellm-db Postgres service) — deliberately not via the static
// litellm-config.yaml, since a file-defined model under the same alias would
// keep getting load-balanced against whatever the admin picks here.
@Injectable()
export class LiteLlmAdminService implements OnModuleInit {
  private readonly logger = new Logger(LiteLlmAdminService.name);

  isConfigured(): boolean {
    return Boolean(PROXY_URL && MASTER_KEY);
  }

  async onModuleInit(): Promise<void> {
    if (!this.isConfigured()) return;
    try {
      await this.ensureDefaultModels();
    } catch (err) {
      this.logger.warn(
        `Could not verify/seed default LiteLLM models: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  getProviderStatuses(): ProviderStatus[] {
    return PROVIDERS.map((p) => {
      const value = process.env[p.envVar];
      return { name: p.name, envVar: p.envVar, configured: Boolean(value), maskedKey: value ? maskKey(value) : null };
    });
  }

  getModelChoices(): ModelChoice[] {
    return MODEL_CHOICES;
  }

  async listRoutingRules(): Promise<RoutingRule[]> {
    if (!this.isConfigured()) {
      return TASK_ALIASES.map((alias) => ({ alias, model: 'LiteLLM not configured', id: null }));
    }
    const models = await this.fetchModelList();
    return TASK_ALIASES.map((alias) => {
      const entry = models.find((m) => m.model_name === alias);
      return { alias, model: entry?.model ?? 'unassigned', id: entry?.id ?? null };
    });
  }

  async setRoutingRule(alias: TaskAlias, model: string, envVar: string): Promise<void> {
    if (!this.isConfigured()) throw new Error('LiteLLM proxy is not configured.');
    const existing = (await this.fetchModelList()).filter((m) => m.model_name === alias);
    for (const entry of existing) {
      await this.deleteModel(entry.id);
    }
    await this.createModel(alias, model, envVar);
  }

  private async ensureDefaultModels(): Promise<void> {
    const models = await this.fetchModelList();
    for (const alias of TASK_ALIASES) {
      if (!models.some((m) => m.model_name === alias)) {
        await this.createModel(alias, 'deepseek/deepseek-chat', 'LLM_API_KEY');
        this.logger.log(`Seeded default LiteLLM model for ${alias} -> deepseek/deepseek-chat`);
      }
    }
  }

  private async fetchModelList(): Promise<ModelEntry[]> {
    const response = await fetch(`${PROXY_URL}/model/info`, { headers: { Authorization: `Bearer ${MASTER_KEY}` } });
    if (!response.ok) throw new Error(`LiteLLM /model/info failed: ${response.status}`);
    const json = (await response.json()) as {
      data: { model_name: string; litellm_params: { model: string }; model_info: { id: string } }[];
    };
    return json.data.map((d) => ({ id: d.model_info.id, model_name: d.model_name, model: d.litellm_params.model }));
  }

  private async createModel(alias: string, model: string, envVar: string): Promise<void> {
    const response = await fetch(`${PROXY_URL}/model/new`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${MASTER_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model_name: alias,
        litellm_params: {
          model,
          api_key: `os.environ/${envVar}`,
          ...(envVar === 'LLM_API_KEY' ? { api_base: 'os.environ/LLM_BASE_URL' } : {}),
        },
      }),
    });
    if (!response.ok) throw new Error(`LiteLLM /model/new failed: ${response.status} ${await response.text()}`);
  }

  private async deleteModel(id: string): Promise<void> {
    const response = await fetch(`${PROXY_URL}/model/delete`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${MASTER_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (!response.ok) throw new Error(`LiteLLM /model/delete failed: ${response.status} ${await response.text()}`);
  }
}
