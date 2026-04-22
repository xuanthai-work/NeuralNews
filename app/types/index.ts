export interface Story {
  id: number;
  title: string;
  url: string;
  source?: string;
  hn_score?: number;
  author: string;
  timestamp: string | null;
  ai_score: number;
  bullet_points: string[];
}

export interface Data {
  generated_at: string;
  total_stories: number;
  sources?: string[];
  stories: Story[];
}

export type Category = "all" | "benchmarks" | "ai-blogs" | "tech-news" | "community";

export const CATEGORY_SOURCES: Record<string, string[]> = {
  benchmarks: ["Hugging Face Benchmarks", "Hugging Face Papers", "LMSys LMArena", "LMSys Vision Arena", "Papers With Code"],
  "ai-blogs": ["Anthropic", "OpenAI", "Google AI", "DeepMind", "Meta AI", "Microsoft AI", "Ollama", "Oh My Pi"],
  "tech-news": ["TechCrunch", "The Verge", "Ars Technica"],
  community: ["Hacker News", "Reddit", "Lobsters"],
};

export const CATEGORY_COLORS: Record<Category, string> = {
  all: "bg-zinc-700 text-zinc-100",
  benchmarks: "bg-amber-500/20 text-amber-400 border-amber-500/50",
  "ai-blogs": "bg-blue-500/20 text-blue-400 border-blue-500/50",
  "tech-news": "bg-purple-500/20 text-purple-400 border-purple-500/50",
  community: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50",
};
