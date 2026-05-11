# NeuralNews · Handoff

Last updated: 2026-05-11. Snapshot of the project as it stands so anyone (or future-you) can pick it up cold.

## What this is

AI-curated tech news dashboard. Python scraper pulls from 15+ sources every 6 hours, AI scores stories for relevance, Next.js frontend displays them as a PWA with full SEO. 44+ stories pre-rendered as static HTML article pages. Live LLM leaderboard + model catalog backed by the Chatbot Arena API.

Live at: **neural-news.vercel.app** (Vercel) · Repo: **github.com/xuanthai-work/NeuralNews**

## Access & URLs

| Thing | URL / Location |
|-------|---------------|
| Production site | https://neural-news.vercel.app (or your custom domain) |
| GitHub repo | https://github.com/xuanthai-work/NeuralNews |
| Vercel dashboard | https://vercel.com/xuanthai-work/neural-news |
| GitHub Actions | https://github.com/xuanthai-work/NeuralNews/actions/workflows/scrape.yml |
| Repo secrets | https://github.com/xuanthai-work/NeuralNews/settings/secrets/actions |
| Local working tree | `/home/d14-jayz/Projects/ai-news-web/` |
| Local `.env` | Has the Azure OpenAI / Techvify credentials |

**Credentials needed for anything backend:**
- `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_DEPLOYMENT`
- Stored in: local `.env` + GitHub Actions secrets + Vercel env vars

## How it's deployed

```
┌─────────────────────────────────────────────────────────────────┐
│   GitHub Actions cron (every 6h)                                │
│   .github/workflows/scrape.yml                                  │
│   • runs python3 scraper.py                                     │
│   • commits data.json + public/data.json as github-actions[bot] │
└────────────────────────┬────────────────────────────────────────┘
                         │ git push to main
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│   GitHub main branch                                            │
└────────────────────────┬────────────────────────────────────────┘
                         │ webhook
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│   Vercel (sin1 region, Singapore)                               │
│   • Auto-deploys every push                                     │
│   • Pre-renders / + /article/[id] (44+) + /model-hub/[slug] (26)│
│   • 60-second revalidate on /, /article/[id]                    │
│   • 1-hour revalidate on /model-hub/[slug]                      │
└─────────────────────────────────────────────────────────────────┘
```

**Result:** Push → Vercel rebuilds → fresh news live within ~2 min. Total cost: $0/mo.

## Common workflows

### Run locally
```bash
cd /home/d14-jayz/Projects/ai-news-web
npm run dev               # http://localhost:3000
```

### Refresh data locally
```bash
python3 scraper.py        # writes data.json + public/data.json
```

### Push code changes
```bash
git add <files>
git commit -m "..."
git pull --rebase origin main   # the cron may have pushed while you were working
git push origin main
```

The pull-rebase step matters — the cron commits every 6h. If you skip it, your push gets rejected with `fetch first`. (Configured globally: `git config --global pull.rebase true` makes this automatic.)

### Force a fresh scrape
1. Go to **Actions → Scrape news feed**
2. Click **Run workflow** (top right)
3. Wait ~1 min, refresh the site

### Add env vars to production
Vercel dashboard → Project Settings → Environment Variables → Add → Redeploy.

## Where things live

```
app/
├── page.tsx                      Server Component, reads data.json, passes to HomeClient
├── HomeClient.tsx                Search, filter, refresh, news-toast wiring
├── layout.tsx                    Root layout, PWA tags, SW registration
├── manifest.ts                   PWA manifest (/manifest.webmanifest)
│
├── article/[id]/
│   ├── page.tsx                  Server Component, generateStaticParams over all stories
│   └── ArticleClient.tsx         Back, share, bookmark interactivity
│
├── model-hub/
│   ├── page.tsx                  Catalog grid; PROVIDER_CONFIGS map for badges
│   └── [slug]/
│       ├── page.tsx              Server Component, generateStaticParams from /api/models
│       └── ModelDetailClient.tsx Hero, links, related news, similar models
│
├── api/
│   ├── benchmarks/route.ts       Arena leaderboard proxy
│   ├── models/route.ts           Thin wrapper around getModels() from lib
│   └── scrape/route.ts           Spawns Python (works locally only — no Python on Vercel)
│
├── lib/
│   ├── data.ts                   getNewsData() — reads public/data.json server-side
│   └── models.ts                 getModels(), getModelBySlug(), modelToSlug(), PROVIDER_LINKS
│
├── hooks/
│   ├── useNews.ts                Feed state, URL-as-source-of-truth filters
│   ├── useSavedStories.ts        localStorage bookmarks, cross-tab sync
│   ├── useDataFreshness.ts       5-min poll for new data, tab-focus check
│   └── useOnlineStatus.ts        navigator.onLine reactive state
│
├── components/                   Sidebar, Header, NewsCard, BookmarkButton,
│                                 NewStoriesToast, OfflineIndicator, ServiceWorkerRegistration, ...
│
├── context/ThemeContext.tsx      darkMode + autoRefresh toggles, localStorage-backed
└── types/index.ts                Story, Data, Category, CATEGORY_SOURCES

scraper.py                        Async Python scraper, 15+ sources
data.json / public/data.json      Scraper output (BOTH tracked in git)
.cache.json                       Scraper runtime cache (gitignored)
public/sw.js                      Service worker — cache strategies per route type
vercel.json                       Region pin: sin1 (Singapore)
.github/workflows/scrape.yml      6-hour cron, concurrency guard, secrets validation
```

## Known limitations & gotchas

### `/api/scrape` doesn't work on Vercel
Vercel runs Node, not Python. The route calls `spawn("python3", ...)` which fails. The UI handles this gracefully — `handleRefresh` falls back to `router.refresh()` which re-fetches `data.json` from the latest committed version. Manual triggering of scraping happens via GitHub Actions only.

### "In the news" matching is fuzzy
The model detail page matches stories by token overlap with the model name. Very generic names (`gpt-5.5-high` → only `gpt` is significant) may produce noisy or empty results. Tweak `STOPWORDS` or matching threshold in `app/model-hub/[slug]/page.tsx` if needed.

### Arena API adds new vendors over time
When a new vendor shows up (e.g., recently added Moonshot, Xiaomi, Z.ai, Baidu), it'll fall through to the muted "Other" styling unless added to `PROVIDER_CONFIGS` in `app/model-hub/page.tsx`. Lookup is case-insensitive but the entry has to exist.

### Two-place category mapping
Story categorization for **filtering** lives in `CATEGORY_SOURCES` (`app/types/index.ts`), but the **badge label** on `NewsCard` is computed by a separate heuristic. If you add a new source category, update both. Easy refactor target — unify them into one helper.

### Workflow permissions must be "Read and write"
Settings → Actions → General. If set to read-only, the cron's `git push` step fails with exit 128. Already configured but worth noting if anyone re-imports/forks.

### `data.json` and `public/data.json` are both tracked
Don't add them to `.gitignore` — the scraper writes both, and the workflow commits both, so the frontend has data on first load. `.cache.json` is the only scraper file that stays ignored.

## What was punted / future work

These came up in discussions but aren't built:

### Auth / accounts
Discussed thoroughly — punted. Adding auth requires a database, and bookmarks/settings work fine in localStorage for single-device users. If we ever want bookmark sync across devices: recommended stack was **better-auth + Neon Postgres** (free, modern, self-hosted, no monthly fee per user). Social login (GitHub/Google) only — skip the password reset rabbit hole.

### X (Twitter) news feed page
User wanted a Twitter-style timeline of AI company posts. Punted because X killed its free API in 2023 ($200/mo minimum now), and Nitter scraping is unreliable. The alternative we'd build instead: render existing RSS feeds (Anthropic, OpenAI blogs, etc.) as a Twitter-style vertical timeline. Same content, no scraping fragility.

### Quick win: unify category logic
Move the source→category mapping into one function in `app/lib/categories.ts` or similar. Currently `NewsCard.tsx` and `StoryCard.tsx` each have their own `getCategoryConfig` heuristic. Filter and badge can drift apart (already happened once with arXiv — fixed by adding to both lists). One source of truth would prevent recurrence.

### Quick win: PWA icons
`app/manifest.ts` currently references `favicon.ico` for the install icon. For a polished install experience, add 192×192 and 512×512 PNG icons (and a maskable variant) to `public/` and update the manifest's `icons` array.

## Troubleshooting

**Workflow shows red X, "Process completed with exit code 128"**
→ Either workflow permissions are read-only, or `.gitignore` is excluding `public/data.json` again. Check repo Settings → Actions → General, and `git check-ignore -v public/data.json`.

**Workflow runs but produces "AI credentials missing"**
→ The three secrets aren't set. Repo Settings → Secrets → Actions. Falls back to weighted keyword scoring (works but worse).

**Local push rejected with "fetch first"**
→ The cron pushed while you were coding. `git pull --rebase origin main && git push`.

**Model detail page shows "In the news: 0 stories" for everything**
→ Either `data.json` doesn't have recent stories or the match is too strict. Check `STOPWORDS` in `app/model-hub/[slug]/page.tsx`.

**Build fails on Vercel with "Arena API returned 500"**
→ `api.wulong.dev` was down at build time. `generateStaticParams` returns empty array via its try/catch so build succeeds with zero pre-rendered model pages — they'll render on-demand instead. Usually self-corrects on next deploy.

**Refresh button shows "Error: Failed to refresh" in production**
→ Old behavior. Should now fall back to `router.refresh()` gracefully. If you see the error message, the fallback path in `useNews.handleRefresh` has a bug.

**`/manifest.webmanifest` returns 404 in dev**
→ Restart `npm run dev`. The manifest is generated by `app/manifest.ts`; sometimes turbopack doesn't pick it up immediately.

## Commit message conventions

Following conventional commits roughly:
- `feat(scope):` new feature
- `fix(scope):` bug fix
- `chore:` housekeeping (data updates from cron use this)
- `docs:` documentation only
- `ci:` workflow changes

Every Claude-assisted commit ends with:
```
Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

## Quick history (what shipped today, 2026-05-07 through 2026-05-11)

In rough order:
1. Updated `CLAUDE.md` via `/init`
2. Fixed feed density (5 → 10 stories/source, added arXiv + Dev.to + 2 subreddits, weighted keyword fallback)
3. Persistent saved articles (localStorage + cross-tab sync)
4. Live model hub backed by `/api/models` (replaced hardcoded SAMPLE_MODELS)
5. Article detail view `/article/[id]` with related stories
6. SSR migration — `/` and `/article/[id]` became Server Components
7. Shareable filter URLs (`?category=`, `?q=`)
8. New-story toast notification (polling + tab-focus check)
9. PWA + offline support (manifest, service worker, offline indicator)
10. Hardened GitHub Actions workflow (concurrency, caching, summary)
11. Bumped action versions for Node 24
12. Fixed `.gitignore` excluding `data.json` (broke the cron commit step)
13. Tagged arXiv/LMSys cards as RESEARCH (badge logic was out of sync with filter logic)
14. Refresh button gracefully degrades on Vercel (no Python)
15. Region pinned to Singapore (`vercel.json`)
16. Model detail pages `/model-hub/[slug]` with related news + similar models
17. Added vendor configs for Baidu, Moonshot, Xiaomi, Z.ai, 01.AI
18. Fixed provider filter row scrollbar on desktop

All 18 land on `main` in incremental commits. See `git log` for the full sequence.
