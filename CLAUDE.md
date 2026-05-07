# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NeuralNews is an AI-powered news aggregator dashboard. It fetches stories from 20+ sources (AI blogs, tech news, benchmarks, community), scores them for relevance using AI, and displays curated stories in a modern dark-mode interface.

This is a **hybrid Next.js + Python project**: the frontend is a Next.js app, and the backend scraping/processing is done by a Python script.

## Technology Stack

- **Frontend**: Next.js 16.2.4, React 19.2.4, TypeScript 5, Tailwind CSS v4
- **Font**: Geist (via `next/font/google`)
- **Backend Scraper**: Python 3.10+ with `asyncio`, `aiohttp`, `feedparser`
- **AI Scoring**: Azure OpenAI or Techvify AI Gateway (OpenAI-compatible)

## Common Commands

```bash
# Frontend development
npm run dev          # Start Next.js dev server on localhost:3000
npm run build        # Build for production
npm run lint         # Run ESLint (eslint-config-next)

# Python scraper (requires .env with Azure OpenAI credentials)
pip install -r requirements.txt   # Install Python dependencies
python3 scraper.py                # Run scraper → outputs data.json

# The scraper auto-copies data.json to public/data.json for the frontend
```

## Architecture

### Data Flow

1. **Python scraper** (`scraper.py`) fetches stories from 20+ sources via async HTTP requests
2. **AI scoring**: Each story is scored 1-10 for relevance and gets 3 bullet points extracted via Azure OpenAI API (or fallback keyword scoring if no API key)
3. **Filter**: Only stories with score >= 7 are kept
4. **Output**: Results saved to `data.json` and copied to `public/data.json`
5. **Frontend**: The main page (`/`) loads `public/data.json` client-side via `fetch("/data.json")`
6. **Auto-refresh**: GitHub Actions runs the scraper every 6 hours and commits updated `data.json`

### Frontend Structure (Next.js App Router)

| Route | File | Purpose |
|-------|------|---------|
| `/` | `app/page.tsx` | Main news feed dashboard with search, category filtering, stats |
| `/benchmarks` | `app/benchmarks/page.tsx` | Live LLM leaderboard from Chatbot Arena API |
| `/model-hub` | `app/model-hub/page.tsx` | Static model catalog with specs and pricing |
| `/saved` | `app/saved/page.tsx` | Saved articles (placeholder, uses local state) |
| `/settings` | `app/settings/page.tsx` | Dark mode toggle, auto-refresh, data source info |
| `/api/scrape` | `app/api/scrape/route.ts` | POST endpoint that spawns `python3 scraper.py` |
| `/api/benchmarks` | `app/api/benchmarks/route.ts` | GET proxy to Wu Long's Arena AI Leaderboards API |

### Key Frontend Patterns

- **All pages are Client Components** (`"use client"`) — no Server Components or SSR data fetching
- **Theme**: Managed via `ThemeContext` (`app/context/ThemeContext.tsx`) with `darkMode` and `autoRefresh` states persisted to `localStorage`. Uses Tailwind classes like `bg-zinc-950` (dark) vs `bg-zinc-50` (light)
- **News Data**: Loaded in `useNews` hook (`app/hooks/useNews.ts`) which fetches `/data.json`, handles search/category filtering, and provides a `handleRefresh` function that calls `/api/scrape`
- **Navigation**: `Sidebar` (desktop, fixed left) + `BottomNav` (mobile, fixed bottom)
- **Types**: Centralized in `app/types/index.ts` — `Story`, `Data`, `Category`, `CATEGORY_SOURCES`, `CATEGORY_COLORS`

### Python Scraper Architecture

- **Fully async**: Uses `asyncio` + `aiohttp` with semaphore-controlled concurrency (`MAX_CONCURRENT_REQUESTS = 10`)
- **Sources**: Hacker News, Reddit (r/technology, r/programming, r/MachineLearning), TechCrunch RSS, The Verge RSS, Ars Technica RSS, Lobsters RSS, AI company blogs (Anthropic, OpenAI, Google AI, DeepMind, Meta AI, Microsoft AI, Ollama), Hugging Face models/papers, LMSys LMArena, Papers With Code
- **Caching**: In-memory + disk cache (`.cache.json`) with 1-hour TTL to avoid re-processing the same stories
- **Batch AI processing**: Stories are scored in parallel batches of 5 via `process_stories_batch_parallel()`
- **Benchmark boost**: Stories from benchmark sources get +2 score boost (capped at 10)

## Configuration

### Environment Variables (`.env`)

The scraper reads from `.env` via `python-dotenv`:

```bash
AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com"
AZURE_OPENAI_API_KEY="your-api-key"
AZURE_OPENAI_DEPLOYMENT="gpt-35-turbo"  # or your deployment name
```

If the endpoint contains `aigateway.techvify.dev`, the scraper uses Techvify AI Gateway format (Bearer token). Otherwise, it uses Azure OpenAI format (`api-key` header).

### GitHub Actions

`.github/workflows/scrape.yml` runs every 6 hours. It requires these repository secrets:
- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_API_KEY`
- `AZURE_OPENAI_DEPLOYMENT` (optional, defaults to `gpt-35-turbo`)

## Important Notes

- The existing `AGENTS.md` contains a critical warning: **"This is NOT the Next.js you know"** — this project uses Next.js 16 with breaking changes. Read guides in `node_modules/next/dist/docs/` before writing code and heed deprecation notices.
- `data.json` is checked into the repo (not gitignored) so the frontend always has data to display. The scraper updates it in-place.
- The `public/data.json` copy is what the frontend actually fetches at runtime.
- The benchmarks page uses Wu Long's Arena AI Leaderboards API (`api.wulong.dev`) — a free, no-auth API that proxies LMSys Chatbot Arena data.
- The model-hub page contains hardcoded sample data (`SAMPLE_MODELS` array) — it is not connected to a live API.
