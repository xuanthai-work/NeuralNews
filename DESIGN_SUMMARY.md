# AI News Aggregator - Design Summary

## Project Overview

A **zero-cost AI-powered news aggregator** that fetches tech news from 17+ sources, scores relevance using AI, and displays curated stories in a modern dark-mode dashboard.

---

## Visual Design

### Theme: Dark Mode Professional
- **Background**: `bg-zinc-950` (near-black, easy on eyes)
- **Cards**: `bg-zinc-900` with `border-zinc-800`
- **Text**: `text-zinc-100` (primary), `text-zinc-400/500` (secondary)
- **Accents**: Blue gradient header (`from-blue-400 to-purple-500`)

### Color Coding (AI Score Badges)
| Score | Color | Badge |
|-------|-------|-------|
| 9-10 | Emerald | `bg-emerald-500` - High Priority |
| 7-8 | Green | `bg-green-500` - Recommended |
| 5-6 | Yellow | `bg-yellow-500` - Moderate |
| 1-4 | Red | `bg-red-500` - Low (filtered out) |

### Typography
- **Font**: System sans-serif (Inter/Geist default)
- **Headings**: Bold, gradient text for main title
- **Body**: Medium weight, readable sizes (sm/lg classes)

---

## Layout Structure

### Header (Sticky)
- Logo/Title with gradient
- Timestamp ("Updated: [date]")
- Search bar with icon (right-aligned)
- Backdrop blur effect

### Stats Bar (4 columns)
1. **Total Stories** (blue) - Count of filtered stories
2. **Sources** (green) - Number of active sources
3. **High Priority 9+** (emerald) - Top-tier stories
4. **Recommended 7+** (purple) - All passing threshold
5. **Showing** (yellow) - Current filtered count

### Story Grid (Responsive)
- **Desktop**: 3 columns (`lg:grid-cols-3`)
- **Tablet**: 2 columns (`md:grid-cols-2`)
- **Mobile**: 1 column (full width)

### Story Card Anatomy
```
┌─────────────────────────────────┐
│ [9/10] [Hacker News]   538 pts │  ← Score badge + source + HN score
│                                 │
│ ChatGPT Images 2.0              │  ← Title (hover: blue)
│ openai.com                      │  ← Domain link
│ by wahnfrieden  4/22/2026       │  ← Author + date
│                                 │
│ ─────────────────────────────── │
│ KEY POINTS                      │
│ ✓ Bullet point 1...             │
│ ✓ Bullet point 2...             │
│ ✓ Bullet point 3...             │
│                                 │
│ ─────────────────────────────── │
│ Read Full Story →               │  ← External link
└─────────────────────────────────┘
```

### Card Interactions
- **Hover**: Border brightens (`hover:border-zinc-600`)
- **Title**: Turns blue on hover
- **"Read Full Story"**: Arrow slides right on hover

---

## User Experience

### Search/Filter
- Real-time client-side filtering
- Searches: title + bullet points
- Case-insensitive
- Shows "No stories match" when empty

### Data Flow
1. Scraper runs → saves to `public/data.json`
2. Frontend fetches `/data.json` on load
3. React state manages display
4. Search filters locally (no API call)

### Loading States
- Initial load: "Loading stories..." centered
- Error: Red error message centered
- Empty state: Gray message in grid

---

## Responsive Behavior

| Breakpoint | Layout | Stats |
|------------|--------|-------|
| Mobile (<640px) | 1 column | 2x2 grid |
| Tablet (640-1024px) | 2 columns | 5 in a row |
| Desktop (>1024px) | 3 columns | 5 in a row |

### Mobile Optimizations
- Full-width cards
- Stacked stats (2 per row)
- Search bar below header on small screens

---

## Technical Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **State**: React hooks (useState, useEffect)

### Backend (Scraper)
- **Language**: Python 3.10+
- **HTTP**: requests library
- **RSS Parsing**: feedparser
- **AI**: Azure OpenAI / Techvify Gateway (gemma-4)

### Data Sources (17 total)
- **AI Blogs**: Anthropic, OpenAI, Google AI, DeepMind, Meta AI, Microsoft AI, Ollama, Oh My Pi
- **Tech News**: TechCrunch, The Verge, Ars Technica, Hugging Face Papers
- **Community**: Hacker News, Reddit (r/technology, r/programming, r/MachineLearning), Lobsters

---

## Key Design Decisions

1. **Dark mode first** - Developers prefer dark themes, easier for long reading sessions
2. **Card-based layout** - Scannable, modular, works on any screen size
3. **Score badges** - Instant visual hierarchy (green = good, red = skip)
4. **Source tags** - Users can identify trusted sources at a glance
5. **3 bullet points** - TL;DR format for busy readers
6. **Minimal clicks** - All info visible on card, external link only for full story
7. **Sticky header** - Search always accessible while scrolling

---

## Files

| File | Purpose |
|------|---------|
| `app/page.tsx` | Main dashboard component |
| `public/data.json` | Scraped news data |
| `scraper.py` | Multi-source news scraper |
| `.env` | API credentials (gitignored) |
| `.github/workflows/scrape.yml` | Automated scraping |

---

## Future Enhancements

- [ ] Source filter chips (toggle sources on/off)
- [ ] Bookmark/save stories
- [ ] Dark/light mode toggle
- [ ] Infinite scroll / pagination
- [ ] Story detail modal
- [ ] Email digest export
- [ ] RSS feed of aggregated results
