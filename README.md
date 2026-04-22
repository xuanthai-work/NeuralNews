# Zero-cost AI News Aggregator

An AI-powered news aggregator that fetches stories from **20+ sources**, scores them for relevance using AI, and displays curated stories in a modern dark-mode dashboard.

## Features

- Fetches from 20+ sources (AI blogs, tech news, benchmarks, community)
- **Model Benchmarks**: Hugging Face trending models, LMSys LMArena, Artificial Analysis
- **AI Company Blogs**: Anthropic, OpenAI, Google AI, DeepMind, Meta AI, Microsoft AI, Ollama
- **Tech News**: TechCrunch, The Verge, Ars Technica, Hugging Face Papers
- **Community**: Hacker News, Reddit, Lobsters
- AI-powered relevance scoring (1-10) using Azure OpenAI / Techvify Gateway
- Automatic bullet point extraction for each story
- Filters stories with score >= 7
- Modern, responsive dark-mode dashboard
- Client-side search and filtering
- Automated scraping via GitHub Actions

## Project Structure

```
ai-news-web/
├── scraper.py          # Python scraper with AI processing
├── data.json           # Generated output (gitignored)
├── app/                # Next.js app router
│   └── page.tsx        # Main dashboard
├── public/
│   └── data.json       # Static data for frontend
└── .github/
    └── workflows/
        └── scrape.yml  # Automated scraping workflow
```

## Backend Setup (Python Scraper)

### Prerequisites

- Python 3.10+
- `requests` package: `pip3 install requests`

### Azure OpenAI Configuration

Set the following environment variables before running the scraper:

```bash
export AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com"
export AZURE_OPENAI_API_KEY="your-api-key"
export AZURE_OPENAI_DEPLOYMENT="gpt-35-turbo"  # or your deployment name
```

### Running the Scraper

```bash
python3 scraper.py
```

This will:
1. Fetch stories from 20+ sources (benchmarks, AI blogs, tech news, community)
2. Process each story with AI for relevance scoring
3. Extract 3 bullet points per story
4. Save filtered stories (score >= 7) to `data.json`
5. Auto-copy to `public/data.json` for frontend

## Frontend Setup (Next.js)

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

### Build for Production

```bash
npm run build
npm start
```

## Automated Scraping (GitHub Actions)

The workflow in `.github/workflows/scrape.yml` runs every 6 hours to:
1. Execute the Python scraper
2. Commit and push updated `data.json`

### Enable Automated Scraping

1. Go to your repository Settings > Secrets and variables > Actions
2. Add the following secrets:
   - `AZURE_OPENAI_ENDPOINT`
   - `AZURE_OPENAI_API_KEY`
   - `AZURE_OPENAI_DEPLOYMENT` (optional, defaults to `gpt-35-turbo`)

## Fallback Mode

If Azure OpenAI is not configured, the scraper uses a keyword-based fallback scoring system. This allows testing without API credentials, though results will be less accurate.

## License

MIT
