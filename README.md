# NeuralNews · Zero-cost AI News Aggregator

An AI-curated tech news dashboard. Fetches stories from 15+ sources, scores them for relevance with AI, and serves them as a fast, installable PWA with full SEO and offline support.

## Features

**Content**
- 15+ sources across AI blogs, tech news, benchmarks, community, and research
  - **AI Blogs**: Anthropic, OpenAI, Google AI, DeepMind, Meta AI, Microsoft AI, Ollama
  - **Benchmarks**: Hugging Face trending models, HF Papers, LMSys LMArena, Papers With Code
  - **Tech News**: TechCrunch, The Verge, Ars Technica
  - **Community**: Hacker News, Reddit (5 subreddits incl. r/LocalLLaMA), Lobsters, Dev.to
  - **Research**: arXiv (cs.AI, cs.LG, cs.CL)
- AI relevance scoring (1–10) using Azure OpenAI / Techvify Gateway
- 3 AI-extracted bullet points per story
- Stories with score ≥ 7 kept; benchmark sources get +2 boost

**Frontend**
- Server-side rendered home page + statically generated article pages (full SEO, instant first paint)
- Installable PWA with offline support (service worker caches data + app shell)
- Bookmark stories — persisted in localStorage, sync across tabs
- Live LLM leaderboard (`/benchmarks`) and model catalog (`/model-hub`) backed by the Chatbot Arena API
- Per-article detail view (`/article/[id]`) with key points, related stories, and shareable URL
- Per-model detail view (`/model-hub/[slug]`) with provider links, similar models, and recent news mentioning that model
- Shareable filtered URLs: `/?category=ai-blogs`, `/?q=llama`, etc.
- Auto-detection of new data — toast appears when GitHub Actions ships an update

**Backend**
- Fully async Python scraper (asyncio + aiohttp) with semaphore concurrency control
- 1-hour cache to skip re-processing the same stories
- Weighted-keyword fallback scoring when AI isn't configured
- Automated scraping via GitHub Actions every 6 hours

## Project Structure

```
ai-news-web/
├── scraper.py                       # Async Python scraper with AI scoring
├── data.json                        # Scraper output (committed)
├── public/
│   ├── data.json                    # Frontend-readable copy (committed)
│   └── sw.js                        # Service worker (PWA + offline)
├── app/
│   ├── page.tsx                     # Home (Server Component)
│   ├── HomeClient.tsx               # Home interactivity wrapper
│   ├── layout.tsx                   # Root layout + PWA tags
│   ├── manifest.ts                  # PWA manifest
│   ├── article/[id]/                # Article detail (SSG, pre-rendered)
│   ├── benchmarks/                  # LLM leaderboard
│   ├── model-hub/                   # Live model catalog (+ [slug] detail pages)
│   ├── saved/                       # Bookmarks
│   ├── settings/                    # Theme + auto-refresh toggles
│   ├── api/
│   │   ├── scrape/                  # Spawns scraper.py
│   │   ├── benchmarks/              # Arena leaderboard proxy
│   │   └── models/                  # Enriched model catalog
│   ├── components/                  # Sidebar, NewsCard, BookmarkButton, ...
│   ├── hooks/                       # useNews, useSavedStories, useDataFreshness, ...
│   ├── context/                     # ThemeContext
│   ├── lib/                         # Server-side data loader
│   └── types/                       # Centralized TS types
└── .github/workflows/scrape.yml     # 6-hour cron + manual dispatch
```

## Quick Start

### Frontend

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # Pre-renders all article pages
npm run lint
```

### Backend (Scraper)

```bash
pip install -r requirements.txt
python3 scraper.py   # → writes data.json + public/data.json
```

### Environment

Create `.env` (see `.env.example`):

```bash
AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com"
AZURE_OPENAI_API_KEY="your-api-key"
AZURE_OPENAI_DEPLOYMENT="gpt-35-turbo"
```

If the endpoint contains `aigateway.techvify.dev`, the scraper uses Techvify Gateway format (Bearer token). Otherwise, Azure OpenAI format (`api-key` header).

## Automated Scraping (GitHub Actions)

`.github/workflows/scrape.yml` runs every 6 hours and on manual dispatch.

**Setup:**

1. **Repo Settings → Actions → General → Workflow permissions** — set to **"Read and write permissions"**
2. **Settings → Secrets and variables → Actions** — add:
   - `AZURE_OPENAI_ENDPOINT`
   - `AZURE_OPENAI_API_KEY`
   - `AZURE_OPENAI_DEPLOYMENT` (optional, defaults to `gpt-35-turbo`)

The workflow validates secrets up front (warns + falls back to keyword scoring if missing), runs the scraper, and writes a step summary with story/source counts. Updated `data.json` + `public/data.json` are committed by `github-actions[bot]`.

## Fallback Mode

If Azure OpenAI isn't configured, the scraper uses **weighted keyword scoring** — AI/ML keywords score highest, general tech terms lower. Useful for testing, but real AI scoring is much more accurate.

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript 5, Tailwind CSS v4
- **Backend**: Python 3.10+ (asyncio, aiohttp, feedparser)
- **AI**: Azure OpenAI / Techvify Gateway (OpenAI-compatible)
- **Data sources**: Hacker News + Reddit + RSS feeds + Hugging Face + arXiv + Dev.to + Wu Long's Arena API

## License

MIT
