import { NextRequest, NextResponse } from "next/server";

interface Model {
  rank: number;
  name: string;
  provider: string;
  arena_elo: number;
  confidence: number;
  votes: number;
  license: string;
  parameters: string;
  input_price?: string;
  output_price?: string;
  context_window?: string;
}

interface BenchmarkData {
  updated_at: string;
  models: Model[];
}

// Wu Long's Arena AI Leaderboards API (free, no auth required)
// Source: https://github.com/oolong-tea-2026/arena-ai-leaderboards
const ARENA_API_BASE = "https://api.wulong.dev/arena-ai-leaderboards/v1";

// Map model names to providers
function getProvider(modelName: string): string {
  const providerMap: Record<string, string> = {
    "claude": "Anthropic",
    "gpt": "OpenAI",
    "gemini": "Google",
    "grok": "xAI",
    "llama": "Meta",
    "deepseek": "DeepSeek",
    "mistral": "Mistral AI",
    "command": "Cohere",
    "qwen": "Alibaba",
    "yi": "01.AI",
    "palm": "Google",
    "wizardlm": "Microsoft",
    "vicuna": "LMSys",
    "glm": "Z.ai",
    "muse": "Meta",
  };

  const lowerName = modelName.toLowerCase();
  for (const [keyword, provider] of Object.entries(providerMap)) {
    if (lowerName.includes(keyword)) {
      return provider;
    }
  }
  return "Unknown";
}

// Estimate parameters based on model name
function estimateParameters(modelName: string): string {
  const lowerName = modelName.toLowerCase();

  if (lowerName.includes("opus")) return "~175B";
  if (lowerName.includes("sonnet")) return "~50B";
  if (lowerName.includes("haiku") || lowerName.includes("flash")) return "~10B";
  if (lowerName.includes("405b")) return "405B";
  if (lowerName.includes("70b")) return "70B";
  if (lowerName.includes("8b")) return "8B";
  if (lowerName.includes("deepseek") && lowerName.includes("v3")) return "671B MoE";
  if (lowerName.includes("grok")) return "314B";
  if (lowerName.includes("qwen") && lowerName.includes("max")) return "~200B";
  if (lowerName.includes("mistral") && lowerName.includes("large")) return "123B";
  if (lowerName.includes("gemini")) return "~540B";
  if (lowerName.includes("gpt-5")) return "~200B";

  return "Unknown";
}

// Price estimates by provider (per 1M tokens: input / output)
function getPriceEstimates(provider: string): { input: string; output: string } {
  const prices: Record<string, { input: string; output: string }> = {
    "Anthropic": { input: "$5", output: "$25" },
    "OpenAI": { input: "$5", output: "$20" },
    "Google": { input: "$3", output: "$15" },
    "xAI": { input: "$2", output: "$10" },
    "Meta": { input: "$1", output: "$5" },
    "DeepSeek": { input: "$0.5", output: "$2" },
    "Alibaba": { input: "$1", output: "$5" },
    "01.AI": { input: "$1", output: "$5" },
    "Z.ai": { input: "$1", output: "$5" },
  };
  return prices[provider] || { input: "$1", output: "$5" };
}

// Context window estimates by model name
function getContextWindow(modelName: string): string {
  const lower = modelName.toLowerCase();
  if (lower.includes("claude")) return "1M";
  if (lower.includes("gemini")) return "500K";
  if (lower.includes("grok")) return "256K";
  if (lower.includes("gpt-5") || lower.includes("gpt-4")) return "400K";
  if (lower.includes("llama")) return "128K";
  if (lower.includes("deepseek")) return "128K";
  if (lower.includes("glm")) return "256K";
  return "128K";
}

export async function GET(request: NextRequest) {
  try {
    // Get category from query params
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category") || "text";

    // Validate category - must match Arena API leaderboard names
    const validCategories = ["text", "code", "vision", "document", "image-edit", "image-to-video", "text-to-image", "text-to-video", "search", "video-edit"];
    const safeCategory = validCategories.includes(category) ? category : "text";

    // Fetch from Wu Long's Arena AI Leaderboards API
    const apiUrl = `${ARENA_API_BASE}/leaderboard?name=${safeCategory}`;
    const response = await fetch(apiUrl, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; NeuralNews/1.0)",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Arena API returned ${response.status}`);
    }

    const data = await response.json();

    // Parse Arena leaderboard data
    // API returns: { meta: {...}, models: [{ rank, model, vendor, license, score, ci, votes }] }
    let models: Model[] = [];

    if (data && Array.isArray(data.models)) {
      models = data.models.map((item: any, index: number) => {
        const name = item.model || item.name || "Unknown";
        const elo = Math.round(item.score || item.arena_score || item.elo || item.rating || 1200);
        const provider = item.vendor || getProvider(name);
        const prices = getPriceEstimates(provider);

        return {
          rank: item.rank || index + 1,
          name: name,
          provider: provider,
          arena_elo: elo,
          confidence: Math.round(item.ci || item.confidence || 5),
          votes: item.votes || 0,
          license: item.license || "proprietary",
          parameters: estimateParameters(name),
          input_price: prices.input,
          output_price: prices.output,
          context_window: getContextWindow(name),
        };
      });
    }

    if (models.length === 0) {
      throw new Error("Arena API returned empty data");
    }

    const benchmarkData: BenchmarkData = {
      updated_at: data.meta?.last_updated || data.meta?.fetched_at || new Date().toISOString(),
      models: models.slice(0, 50), // Limit to top 50
    };

    return NextResponse.json(benchmarkData);
  } catch (error) {
    console.error(`Error fetching Arena data:`, error);
    throw error;
  }
}
