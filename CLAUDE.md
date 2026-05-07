# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NeuralNews is an AI-powered news aggregator dashboard. It fetches stories from 15+ sources (AI blogs, tech news, benchmarks, community), scores them for relevance using AI, and displays curated stories in a modern dark-mode interface.

This is a **hybrid Next.js + Python project**: the frontend is a Next.js app (SSR + PWA), and the backend scraping/processing is done by a Python script that runs on a 6-hour cron via GitHub Actions.

## Technology Stack

- **Frontend**: Next.js 16.2.4 (App Router, Server Components, SSG), React 19.2.4, TypeScript 5, Tailwind CSS v4
- **Font**: Geist (via `next/font/google`)
- **Backend Scraper**: Python 3.10+ with `asyncio`, `aiohttp`, `feedparser`
- **AI Scoring**: Azure OpenAI or Techvify AI Gateway (OpenAI-compatible)
- **PWA**: Custom service worker + Next.js `manifest.ts`

## Common Commands

```bash
# Frontend
npm run dev          # Start Next.js dev server on localhost:3000
npm run build        # Production build (pre-renders /article/[id] for all stories)
npm run start        # Run production build
npm run lint         # ESLint (eslint-config-next)

# Python scraper (requires .env with Azure OpenAI credentials)
pip install -r requirements.txt
python3 scraper.py   # Fetches → scores → writes data.json + public/data.json
```

## Architecture

### Data Flow

1. **Python scraper** (`scraper.py`) fetches from 15+ sources via async HTTP, with semaphore-controlled concurrency
2. **AI scoring** — Each story scored 1-10 for relevance + 3 bullet points extracted via Azure OpenAI (or weighted-keyword fallback if no API key)
3. **Filter & boost** — Score >= 7 kept; benchmark sources get +2 boost
4. **Output** — `data.json` and `public/data.json` (frontend reads the public copy)
5. **Server-side rendering** — `app/page.tsx` and `app/article/[id]/page.tsx` read `public/data.json` from disk via `fs/promises` at request time
6. **Auto-update** — GitHub Actions cron runs every 6 hours; the frontend `useDataFreshness` hook polls and toasts when new data lands

### Frontend Structure (Next.js App Router)

| Route | Type | Purpose |
|-------|------|---------|
| `/` | **Server Component** | News feed; reads `data.json` server-side, passes to `HomeClient` |
| `/article/[id]` | **SSG (44+ paths pre-rendered)** | Story detail with key points + related stories; per-article OpenGraph metadata |
| `/saved` | Client Component | localStorage-backed bookmarks |
| `/benchmarks` | Client Component | Live LLM leaderboard from `/api/benchmarks` |
| `/model-hub` | Client Component | Live model catalog from `/api/models` |
| `/settings` | Client Component | Dark mode + auto-refresh toggles |
| `/api/scrape` | POST | Spawns `python3 scraper.py` (used by manual refresh button) |
| `/api/benchmarks` | GET | Proxies Wu Long's Arena AI Leaderboards API (`api.wulong.dev`) |
| `/api/models` | GET | Pulls Arena data + enriches with curated metadata, deduplicates variants, 1-hour cache |
| `/manifest.webmanifest` | Static | PWA manifest from `app/manifest.ts` |
| `/sw.js` | Static (`public/sw.js`) | Service worker — cache-first for assets, SWR for data.json, network-first for HTML/API |

### Key Frontend Patterns

- **Server vs Client split**: home and article pages are async Server Components that load data via `app/lib/data.ts` (`getNewsData()` reads `public/data.json` from disk). Interactivity lives in client wrappers (`HomeClient.tsx`, `ArticleClient.tsx`). Other pages are full Client Components.
- **`revalidate = 60`** on home and article pages — GitHub Actions updates are picked up automatically without rebuilds.
- **URL state**: `useNews` reads `category` and `q` from `useSearchParams` and writes via `router.replace({ scroll: false })` — filtered views are shareable. The home page wraps `HomeClient` in `<Suspense>` because of this (required for `useSearchParams` in static pages).
- **Theme**: `ThemeContext` with `darkMode` + `autoRefresh` persisted to localStorage.
- **Bookmarks**: `useSavedStories` hook stores in localStorage under `neuralnews_saved_stories`; cross-tab sync via `storage` event + custom `savedStoriesChanged` event.
- **New-story polling**: `useDataFreshness` polls `/data.json` every 5 min (skipped when tab hidden, re-checks on focus). Gated by `autoRefresh` toggle. Refresh action calls `router.refresh()` (re-runs SSR, doesn't trigger scraper).
- **PWA**: `ServiceWorkerRegistration` registers `/sw.js` on `window.load` (production only). `OfflineIndicator` shows an amber banner when `navigator.onLine` is false.
- **Types**: Centralized in `app/types/index.ts` — `Story`, `Data`, `Category`, `CATEGORY_SOURCES`.

### Hooks (`app/hooks/`)

- `useNews(initialData?)` — News feed state machine. URL is the source of truth for filters.
- `useSavedStories()` — Bookmark CRUD + count.
- `useDataFreshness(currentGeneratedAt, enabled)` — Polls for new data; tracks dismissed timestamps so users aren't re-prompted for the same update.
- `useOnlineStatus()` — `navigator.onLine` reactive state.

### Components (`app/components/`)

Reusable UI: `Sidebar`, `Header`, `BottomNav`, `Footer`, `StatsGrid`, `CategoryFilter`, `NewsCard`, `StoryCard`, `LoadingState`, `ErrorState`, `EmptyState`. PWA + bookmarks: `BookmarkButton`, `NewStoriesToast`, `OfflineIndicator`, `ServiceWorkerRegistration`. All exported from `app/components/index.ts`.

### Python Scraper Architecture

- **Fully async**: Single event loop with semaphore (`MAX_CONCURRENT_REQUESTS = 10`)
- **Sources** (15 currently active): Hacker News, Reddit (r/technology, r/programming, r/MachineLearning, r/LocalLLaMA, r/artificial), TechCrunch, The Verge, Ars Technica, Lobsters, AI company blogs (Anthropic, OpenAI, Google AI, DeepMind, Meta AI, Microsoft AI, Ollama), Hugging Face (trending models + Papers RSS), LMSys LMArena, Papers With Code, **arXiv (cs.AI, cs.LG, cs.CL)**, **Dev.to**
- **Caching**: In-memory + disk cache (`.cache.json`, gitignored, 1-hour TTL)
- **Batch AI processing**: 5 stories per batch in parallel
- **Benchmark boost**: Stories from benchmark sources get +2 score boost (capped at 10)
- **Fallback scoring**: Weighted keyword tiers (AI/ML high, tech medium, general low) when API not configured

## Configuration

### Environment Variables (`.env`)

```bash
AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com"
AZURE_OPENAI_API_KEY="your-api-key"
AZURE_OPENAI_DEPLOYMENT="gpt-35-turbo"
```

If endpoint contains `aigateway.techvify.dev`, scraper uses Techvify Gateway format (Bearer token). Otherwise Azure OpenAI format (`api-key` header).

### GitHub Actions (`.github/workflows/scrape.yml`)

Runs every 6 hours via cron. Required repo settings:
- **Workflow permissions** must be set to "Read and write" (Settings → Actions → General)
- **Repository secrets**: `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_DEPLOYMENT`

The workflow has concurrency control, pip caching, secret validation, and writes a `$GITHUB_STEP_SUMMARY` with story/source counts. Failed scrapes still publish a summary so the run page shows results at a glance.

## Important Notes

- `AGENTS.md` warning: **"This is NOT the Next.js you know"** — this project uses Next.js 16 with breaking changes. Read guides in `node_modules/next/dist/docs/` before writing code.
- `data.json` and `public/data.json` are checked into the repo so the frontend always has data. The scraper updates both, and GitHub Actions commits both.
- `public/data.json` is what the frontend reads at runtime (and what `getNewsData()` reads server-side).
- `.cache.json` is a Python scraper runtime artifact — not tracked in git.
- The benchmarks and model-hub pages both pull from Wu Long's Arena API (`api.wulong.dev`), free + no-auth.
- Service worker only registers in production (`NODE_ENV === "production"`) to avoid HMR conflicts in dev.
