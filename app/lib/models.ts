// Shared model-fetching logic used by /api/models and /model-hub/[slug].
// Fetches the Arena leaderboard, deduplicates variants, enriches with curated
// metadata, and falls back to inference for unknown models.

export interface Model {
  name: string;
  provider: string;
  description: string;
  context_window: string;
  input_price: number;
  output_price: number;
  parameters?: string;
  knowledge_cutoff?: string;
  max_output?: string;
  arena_elo?: number;
  votes?: number;
  license?: string;
  capabilities: string[];
}

export interface ModelsResponse {
  updated_at: string;
  total: number;
  models: Model[];
}

const ARENA_API = "https://api.wulong.dev/arena-ai-leaderboards/v1/leaderboard?name=text";

interface ArenaModel {
  rank: number;
  model: string;
  vendor?: string;
  license?: string;
  score?: number;
  ci?: number;
  votes?: number;
}

interface ModelMetadata {
  description: string;
  capabilities: string[];
  knowledge_cutoff?: string;
  max_output?: string;
  parameters?: string;
  context_window?: string;
  input_price?: number;
  output_price?: number;
}

const MODEL_METADATA: Record<string, ModelMetadata> = {
  "claude-opus-4-7": {
    description: "Anthropic's most capable model with exceptional reasoning and 1M context window.",
    capabilities: ["Reasoning", "Code", "Vision", "Long Context"],
    knowledge_cutoff: "Jan 2026",
    max_output: "32K",
    parameters: "~200B",
    context_window: "1M",
    input_price: 15,
    output_price: 75,
  },
  "claude-opus-4-6": {
    description: "Previous generation Opus model. Strong reasoning and coding abilities.",
    capabilities: ["Reasoning", "Code", "Vision", "Long Context"],
    knowledge_cutoff: "Apr 2026",
    max_output: "16K",
    parameters: "~175B",
    context_window: "200K",
    input_price: 15,
    output_price: 75,
  },
  "claude-sonnet-4-6": {
    description: "Balanced performance and speed. Anthropic's workhorse model for everyday tasks.",
    capabilities: ["General", "Code", "Vision"],
    knowledge_cutoff: "Apr 2026",
    max_output: "16K",
    parameters: "~70B",
    context_window: "200K",
    input_price: 3,
    output_price: 15,
  },
  "claude-haiku-4-5": {
    description: "Fast, cost-effective model. Best for high-volume applications.",
    capabilities: ["Fast", "General", "Code"],
    knowledge_cutoff: "Oct 2025",
    max_output: "8K",
    parameters: "~10B",
    context_window: "200K",
    input_price: 1,
    output_price: 5,
  },
  "gpt-5": {
    description: "OpenAI's flagship with advanced reasoning, multimodal understanding, and tool use.",
    capabilities: ["Reasoning", "Code", "Vision", "Tool Use"],
    knowledge_cutoff: "Oct 2025",
    max_output: "32K",
    parameters: "~200B",
    context_window: "400K",
    input_price: 10,
    output_price: 40,
  },
  "gpt-4o": {
    description: "Multimodal model with strong vision and audio capabilities.",
    capabilities: ["Vision", "Audio", "General"],
    knowledge_cutoff: "Oct 2024",
    max_output: "16K",
    context_window: "128K",
    input_price: 5,
    output_price: 20,
  },
  "gemini-2.5-pro": {
    description: "Google's most advanced model with native multimodal training.",
    capabilities: ["Vision", "Video", "Audio", "Long Context"],
    knowledge_cutoff: "Jan 2026",
    max_output: "64K",
    parameters: "~150B",
    context_window: "1M",
    input_price: 7,
    output_price: 21,
  },
  "gemini-2.0-flash": {
    description: "Fast, efficient model optimized for high-throughput applications.",
    capabilities: ["General", "Vision", "Fast"],
    knowledge_cutoff: "Jan 2026",
    max_output: "8K",
    context_window: "1M",
    input_price: 0.3,
    output_price: 1.2,
  },
  "grok-4": {
    description: "xAI's flagship model with real-time information access.",
    capabilities: ["Reasoning", "General", "Real-time"],
    knowledge_cutoff: "Continuous",
    max_output: "16K",
    parameters: "~314B",
    context_window: "256K",
    input_price: 5,
    output_price: 15,
  },
  "llama-4": {
    description: "Meta's open-source flagship. Competitive performance with deployment flexibility.",
    capabilities: ["General", "Code", "Open Source"],
    knowledge_cutoff: "Dec 2025",
    max_output: "32K",
    parameters: "~405B",
    context_window: "128K",
    input_price: 0.8,
    output_price: 0.8,
  },
  "deepseek-v3": {
    description: "Cost-efficient MoE model with strong reasoning capabilities.",
    capabilities: ["Reasoning", "Code", "Open Source"],
    knowledge_cutoff: "Sep 2025",
    max_output: "8K",
    parameters: "671B MoE",
    context_window: "128K",
    input_price: 0.5,
    output_price: 2,
  },
  "qwen-max": {
    description: "Alibaba's flagship with strong multilingual and coding abilities.",
    capabilities: ["Multilingual", "Code", "General"],
    knowledge_cutoff: "Sep 2025",
    max_output: "8K",
    parameters: "~200B",
    context_window: "128K",
    input_price: 1,
    output_price: 5,
  },
  "mistral-large": {
    description: "European alternative with strong multilingual capabilities and tool use.",
    capabilities: ["Multilingual", "Code", "Tool Use"],
    knowledge_cutoff: "Feb 2026",
    max_output: "8K",
    parameters: "~123B",
    context_window: "128K",
    input_price: 2,
    output_price: 6,
  },
};

export const PROVIDER_LINKS: Record<string, { docs?: string; pricing?: string; playground?: string; about?: string }> = {
  Anthropic: {
    docs: "https://docs.anthropic.com",
    pricing: "https://www.anthropic.com/pricing",
    playground: "https://console.anthropic.com",
    about: "https://www.anthropic.com/claude",
  },
  OpenAI: {
    docs: "https://platform.openai.com/docs",
    pricing: "https://openai.com/api/pricing/",
    playground: "https://platform.openai.com/playground",
    about: "https://openai.com/chatgpt/overview/",
  },
  Google: {
    docs: "https://ai.google.dev/gemini-api/docs",
    pricing: "https://ai.google.dev/pricing",
    playground: "https://aistudio.google.com",
    about: "https://deepmind.google/technologies/gemini/",
  },
  xAI: {
    docs: "https://docs.x.ai",
    pricing: "https://x.ai/api",
    playground: "https://console.x.ai",
    about: "https://x.ai",
  },
  Meta: {
    docs: "https://www.llama.com/docs/",
    about: "https://www.llama.com",
  },
  DeepSeek: {
    docs: "https://api-docs.deepseek.com",
    pricing: "https://api-docs.deepseek.com/quick_start/pricing",
    playground: "https://chat.deepseek.com",
    about: "https://www.deepseek.com",
  },
  "Mistral AI": {
    docs: "https://docs.mistral.ai",
    pricing: "https://mistral.ai/technology/#pricing",
    playground: "https://chat.mistral.ai",
    about: "https://mistral.ai",
  },
  Alibaba: {
    docs: "https://qwen.readthedocs.io",
    playground: "https://chat.qwen.ai",
    about: "https://qwen.ai",
  },
  Cohere: {
    docs: "https://docs.cohere.com",
    pricing: "https://cohere.com/pricing",
    playground: "https://dashboard.cohere.com/playground",
    about: "https://cohere.com",
  },
  "Z.ai": {
    about: "https://z.ai",
  },
  Microsoft: {
    docs: "https://learn.microsoft.com/azure/ai-services",
    about: "https://azure.microsoft.com/products/ai-services",
  },
};

export function modelToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getProvider(modelName: string): string {
  const lower = modelName.toLowerCase();
  if (lower.includes("claude")) return "Anthropic";
  if (lower.includes("gpt") || lower.includes("o1") || lower.includes("o3")) return "OpenAI";
  if (lower.includes("gemini") || lower.includes("palm")) return "Google";
  if (lower.includes("grok")) return "xAI";
  if (lower.includes("llama")) return "Meta";
  if (lower.includes("deepseek")) return "DeepSeek";
  if (lower.includes("mistral") || lower.includes("mixtral")) return "Mistral AI";
  if (lower.includes("qwen")) return "Alibaba";
  if (lower.includes("command") || lower.includes("cohere")) return "Cohere";
  if (lower.includes("yi")) return "01.AI";
  if (lower.includes("glm")) return "Z.ai";
  if (lower.includes("phi")) return "Microsoft";
  return "Other";
}

function findMetadata(modelName: string): ModelMetadata | null {
  const lower = modelName.toLowerCase();
  for (const [key, meta] of Object.entries(MODEL_METADATA)) {
    if (lower.includes(key)) return meta;
  }
  return null;
}

function inferDescription(name: string, provider: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("flash") || lower.includes("haiku") || lower.includes("mini") || lower.includes("nano")) {
    return `Fast, lightweight model from ${provider}. Optimized for speed and cost efficiency.`;
  }
  if (lower.includes("opus") || lower.includes("ultra") || lower.includes("max") || lower.includes("pro")) {
    return `${provider}'s flagship model with advanced reasoning and capabilities.`;
  }
  if (lower.includes("vision")) {
    return `Multimodal model from ${provider} with strong visual understanding.`;
  }
  if (lower.includes("code")) {
    return `Specialized coding model from ${provider}.`;
  }
  return `Large language model from ${provider}.`;
}

function inferCapabilities(name: string): string[] {
  const lower = name.toLowerCase();
  const caps = new Set<string>(["General"]);
  if (lower.includes("thinking") || lower.includes("reasoning") || lower.includes("o1") || lower.includes("o3")) caps.add("Reasoning");
  if (lower.includes("code")) caps.add("Code");
  if (lower.includes("vision") || lower.includes("multimodal")) caps.add("Vision");
  if (lower.includes("flash") || lower.includes("haiku") || lower.includes("mini")) caps.add("Fast");
  return Array.from(caps);
}

function inferContextWindow(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("claude")) return "1M";
  if (lower.includes("gemini")) return "1M";
  if (lower.includes("grok")) return "256K";
  if (lower.includes("gpt-5") || lower.includes("gpt-4")) return "400K";
  if (lower.includes("llama")) return "128K";
  if (lower.includes("deepseek")) return "128K";
  if (lower.includes("glm")) return "256K";
  return "128K";
}

function inferParameters(name: string): string | undefined {
  const lower = name.toLowerCase();
  if (lower.includes("opus")) return "~175B";
  if (lower.includes("sonnet")) return "~50B";
  if (lower.includes("haiku") || lower.includes("flash")) return "~10B";
  if (lower.includes("405b")) return "405B";
  if (lower.includes("70b")) return "70B";
  if (lower.includes("8b")) return "8B";
  if (lower.includes("deepseek") && lower.includes("v3")) return "671B MoE";
  if (lower.includes("grok")) return "314B";
  return undefined;
}

function inferPricing(provider: string): { input: number; output: number } {
  const prices: Record<string, { input: number; output: number }> = {
    Anthropic: { input: 5, output: 25 },
    OpenAI: { input: 5, output: 20 },
    Google: { input: 3, output: 15 },
    xAI: { input: 2, output: 10 },
    Meta: { input: 1, output: 5 },
    DeepSeek: { input: 0.5, output: 2 },
    Alibaba: { input: 1, output: 5 },
    "Mistral AI": { input: 2, output: 6 },
    Cohere: { input: 2.5, output: 10 },
    "01.AI": { input: 1, output: 5 },
    "Z.ai": { input: 1, output: 5 },
    Microsoft: { input: 0.5, output: 2 },
  };
  return prices[provider] || { input: 1, output: 5 };
}

export async function getModels(): Promise<ModelsResponse> {
  const response = await fetch(ARENA_API, {
    headers: {
      Accept: "application/json",
      "User-Agent": "Mozilla/5.0 (compatible; NeuralNews/1.0)",
    },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Arena API returned ${response.status}`);
  }

  const data = await response.json();
  const arenaModels: ArenaModel[] = Array.isArray(data.models) ? data.models : [];

  const seen = new Set<string>();
  const models: Model[] = [];

  for (const arena of arenaModels.slice(0, 30)) {
    const name = arena.model || "Unknown";
    const baseKey = name.toLowerCase().replace(/-thinking$|-instruct$|-chat$/, "");
    if (seen.has(baseKey)) continue;
    seen.add(baseKey);

    const provider = arena.vendor || getProvider(name);
    const metadata = findMetadata(name);
    const fallbackPricing = inferPricing(provider);

    models.push({
      name,
      provider,
      description: metadata?.description || inferDescription(name, provider),
      context_window: metadata?.context_window || inferContextWindow(name),
      input_price: metadata?.input_price ?? fallbackPricing.input,
      output_price: metadata?.output_price ?? fallbackPricing.output,
      parameters: metadata?.parameters || inferParameters(name),
      knowledge_cutoff: metadata?.knowledge_cutoff,
      max_output: metadata?.max_output,
      arena_elo: Math.round(arena.score || 0),
      votes: arena.votes || 0,
      license: arena.license || "proprietary",
      capabilities: metadata?.capabilities || inferCapabilities(name),
    });
  }

  return {
    updated_at: data.meta?.last_updated || new Date().toISOString(),
    total: models.length,
    models,
  };
}

export async function getModelBySlug(slug: string): Promise<Model | null> {
  const { models } = await getModels();
  return models.find((m) => modelToSlug(m.name) === slug) || null;
}
