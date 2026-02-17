import { z, ZodSchema } from 'zod';

type AzureUsage = {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
};

export type AgentUsage = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
};

export type AgentRunOptions<T extends ZodSchema> = {
  agentName: string;
  systemPrompt: string;
  input: unknown;
  schema: T;
  maxRepairAttempts?: number;
};

export type AgentRunResult<T> = {
  output: T;
  usage: AgentUsage;
  attempts: number;
};

type Pricing = {
  inputPer1kUsd: number;
  outputPer1kUsd: number;
};

const defaultPricing: Pricing = {
  inputPer1kUsd: 0.005,
  outputPer1kUsd: 0.015
};

const safeParseJson = (raw: string) => {
  const trimmed = raw.trim();
  const noFence = trimmed.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  return JSON.parse(noFence) as unknown;
};

const usageFromResponse = (usage?: AzureUsage): AgentUsage => {
  const promptTokens = usage?.prompt_tokens ?? 0;
  const completionTokens = usage?.completion_tokens ?? 0;
  const totalTokens = usage?.total_tokens ?? promptTokens + completionTokens;

  return {
    promptTokens,
    completionTokens,
    totalTokens,
    estimatedCostUsd: (promptTokens / 1000) * defaultPricing.inputPer1kUsd + (completionTokens / 1000) * defaultPricing.outputPer1kUsd
  };
};

export class AgentRunner {
  private readonly endpoint: string;
  private readonly apiKey: string;
  private readonly deployment: string;
  private readonly apiVersion: string;

  constructor({
    endpoint = process.env.AZURE_OPENAI_ENDPOINT,
    apiKey = process.env.AZURE_OPENAI_API_KEY,
    deployment = process.env.AZURE_OPENAI_DEPLOYMENT,
    apiVersion = '2024-02-15-preview'
  }: {
    endpoint?: string;
    apiKey?: string;
    deployment?: string;
    apiVersion?: string;
  } = {}) {
    if (!endpoint || !apiKey || !deployment) {
      throw new Error('Missing Azure OpenAI configuration for AgentRunner.');
    }

    this.endpoint = endpoint;
    this.apiKey = apiKey;
    this.deployment = deployment;
    this.apiVersion = apiVersion;
  }

  async run<T extends ZodSchema>(options: AgentRunOptions<T>): Promise<AgentRunResult<z.infer<T>>> {
    const maxRepairAttempts = options.maxRepairAttempts ?? 2;
    let attempts = 0;
    let usage: AgentUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0, estimatedCostUsd: 0 };

    let latestRaw = '';
    let latestError = '';

    while (attempts <= maxRepairAttempts) {
      const isRepairAttempt = attempts > 0;
      const userPayload = isRepairAttempt
        ? {
            mode: 'repair',
            targetSchema: options.schema.toString(),
            invalidJson: latestRaw,
            validationError: latestError
          }
        : options.input;

      const response = await this.callModel({
        systemPrompt: options.systemPrompt,
        userPayload
      });

      usage = {
        promptTokens: usage.promptTokens + response.usage.promptTokens,
        completionTokens: usage.completionTokens + response.usage.completionTokens,
        totalTokens: usage.totalTokens + response.usage.totalTokens,
        estimatedCostUsd: usage.estimatedCostUsd + response.usage.estimatedCostUsd
      };

      latestRaw = response.raw;
      try {
        const parsed = safeParseJson(response.raw);
        const validated = options.schema.safeParse(parsed);
        if (validated.success) {
          return {
            output: validated.data,
            usage,
            attempts: attempts + 1
          };
        }

        latestError = validated.error.message;
      } catch (error) {
        latestError = error instanceof Error ? error.message : 'JSON parsing failed';
      }

      attempts += 1;
    }

    throw new Error(`Agent ${options.agentName} failed after ${attempts} attempts. Last error: ${latestError}`);
  }

  private async callModel({ systemPrompt, userPayload }: { systemPrompt: string; userPayload: unknown }) {
    const endpoint = `${this.endpoint}/openai/deployments/${this.deployment}/chat/completions?api-version=${this.apiVersion}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.apiKey
      },
      body: JSON.stringify({
        temperature: 0,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: JSON.stringify(userPayload) }
        ]
      })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Azure chat completion failed (${response.status}): ${text}`);
    }

    const data = await response.json();
    const raw = data?.choices?.[0]?.message?.content;

    if (typeof raw !== 'string') {
      throw new Error('Azure chat completion returned empty content.');
    }

    return {
      raw,
      usage: usageFromResponse(data?.usage)
    };
  }
}
