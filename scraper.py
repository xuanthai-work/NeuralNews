#!/usr/bin/env python3
"""
Zero-cost AI News Aggregator - Multi-Source Scraper
Fetches stories from multiple sources, scores relevance with AI, extracts bullet points.

Sources:
- Hacker News
- Reddit (r/technology, r/programming, r/MachineLearning)
- TechCrunch RSS
- The Verge RSS
- Ars Technica RSS
- Lobsters
- Product Hunt

Configuration via environment variables or .env file:
- AZURE_OPENAI_ENDPOINT: Your Azure OpenAI endpoint
- AZURE_OPENAI_API_KEY: Your Azure OpenAI API key
- AZURE_OPENAI_DEPLOYMENT: Your deployment name (e.g., gpt-35-turbo)
"""

import json
import os
import re
import requests
import feedparser
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv
from urllib.parse import urlparse

# Load environment variables from .env file if it exists
env_path = Path(__file__).parent / ".env"
if env_path.exists():
    load_dotenv(env_path)
    print(f"Loaded environment from .env file")

# Configuration
OUTPUT_FILE = "data.json"
OUTPUT_FILE_PUBLIC = "public/data.json"
MIN_SCORE = 7
STORIES_PER_SOURCE = 5  # Fetch this many from each source

# Azure OpenAI configuration
AZURE_ENDPOINT = os.environ.get("AZURE_OPENAI_ENDPOINT", "")
AZURE_API_KEY = os.environ.get("AZURE_OPENAI_API_KEY", "")
AZURE_DEPLOYMENT = os.environ.get("AZURE_OPENAI_DEPLOYMENT", "gemma-4")

# RSS Feed URLs - General Tech News
RSS_FEEDS = {
    "TechCrunch": "https://techcrunch.com/feed.xml",
    "The Verge": "https://www.theverge.com/rss/index.xml",
    "Ars Technica": "https://feeds.arstechnica.com/arstechnica/index",
    "Hugging Face Papers": "https://huggingface.co/papers/rss",  # Daily ML/AI papers
}

# AI Company & Research Blogs (RSS/Atom feeds)
AI_BLOGS = {
    "Anthropic": "https://www.anthropic.com/rss",
    "OpenAI": "https://openai.com/rss/",
    "Google AI": "https://ai.google/static/documents/rss.xml",
    "DeepMind": "https://deepmind.google/discover/blog/rss/",
    "Meta AI": "https://ai.meta.com/blog/rss/",
    "Microsoft AI": "https://blogs.microsoft.com/ai/feed/",
    "Ollama": "https://ollama.com/blog/rss.xml",
    "Oh My Pi": "https://ohmypi.medium.com/feed",  # Via Medium RSS
}

# AI Model Benchmarks & Leaderboards
BENCHMARK_SOURCES = {
    "LMArena": "https://lmarena.ai",  # LLM leaderboard (scraped)
    "Hugging Face Open LLM": "https://huggingface.co/spaces/HuggingFaceH4/open_llm_leaderboard",
    "Artificial Analysis": "https://artificialanalysis.ai",  # Model benchmarks
    "Papers With Code": "https://paperswithcode.com/sota",  # State-of-the-art ML results
}

# Reddit API (using public JSON endpoint)
REDDIT_SUBREDDITS = ["technology", "programming", "MachineLearning"]

# Lobsters RSS
LOBSTERS_URL = "https://lobste.rs/rss"


def fetch_hacker_news(limit=STORIES_PER_SOURCE):
    """Fetch top stories from Hacker News."""
    print(f"\n{'='*50}")
    print(f"Fetching {limit} stories from Hacker News...")
    print(f"{'='*50}")

    stories = []
    hn_top_url = "https://hacker-news.firebaseio.com/v0/topstories.json"
    hn_item_url = "https://hacker-news.firebaseio.com/v0/item/{}.json"

    try:
        response = requests.get(hn_top_url, timeout=10)
        response.raise_for_status()
        story_ids = response.json()[:limit]

        for story_id in story_ids:
            story = requests.get(hn_item_url.format(story_id), timeout=10).json()
            if story and story.get("title") and story.get("url"):
                stories.append({
                    "title": story.get("title", ""),
                    "url": story.get("url", ""),
                    "source": "Hacker News",
                    "author": story.get("by", "unknown"),
                    "score_hn": story.get("score", 0),
                    "timestamp": datetime.fromtimestamp(story.get("time", 0)).isoformat() if story.get("time") else None,
                    "text": story.get("text", "")
                })
        print(f"  Retrieved {len(stories)} stories")
    except Exception as e:
        print(f"  Error fetching Hacker News: {e}")

    return stories


def fetch_reddit_stories(limit=STORIES_PER_SOURCE):
    """Fetch top stories from Reddit subreddits."""
    print(f"\n{'='*50}")
    print(f"Fetching stories from Reddit...")
    print(f"{'='*50}")

    stories = []
    headers = {"User-Agent": "Mozilla/5.0 (compatible; AI News Aggregator/1.0)"}

    for subreddit in REDDIT_SUBREDDITS:
        try:
            url = f"https://www.reddit.com/r/{subreddit}/hot.json?limit={limit}"
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            data = response.json()

            for post in data["data"]["children"][:limit]:
                post_data = post["data"]
                if post_data.get("url") and not post_data.get("is_self"):
                    stories.append({
                        "title": post_data.get("title", ""),
                        "url": post_data.get("url", ""),
                        "source": f"Reddit (r/{subreddit})",
                        "author": post_data.get("author", "unknown"),
                        "score_hn": post_data.get("score", 0),
                        "timestamp": datetime.fromtimestamp(post_data.get("created_utc", 0)).isoformat() if post_data.get("created_utc") else None,
                        "text": post_data.get("selftext", "")
                    })
            print(f"  Retrieved {limit} stories from r/{subreddit}")
        except Exception as e:
            print(f"  Error fetching r/{subreddit}: {e}")

    return stories


def fetch_rss_feeds(limit=STORIES_PER_SOURCE):
    """Fetch stories from RSS feeds."""
    print(f"\n{'='*50}")
    print(f"Fetching stories from RSS feeds...")
    print(f"{'='*50}")

    stories = []

    for source, url in RSS_FEEDS.items():
        try:
            feed = feedparser.parse(url)
            for entry in feed.entries[:limit]:
                stories.append({
                    "title": entry.get("title", ""),
                    "url": entry.get("link", ""),
                    "source": source,
                    "author": entry.get("author", entry.get("dc_creator", "unknown")),
                    "score_hn": 0,
                    "timestamp": None,
                    "text": entry.get("summary", entry.get("description", ""))
                })
            print(f"  Retrieved {limit} stories from {source}")
        except Exception as e:
            print(f"  Error fetching {source}: {e}")

    return stories


def fetch_ai_blogs(limit=STORIES_PER_SOURCE):
    """Fetch stories from AI company blogs."""
    print(f"\n{'='*50}")
    print(f"Fetching stories from AI blogs...")
    print(f"{'='*50}")

    stories = []

    for source, url in AI_BLOGS.items():
        try:
            feed = feedparser.parse(url)
            for entry in feed.entries[:limit]:
                stories.append({
                    "title": entry.get("title", ""),
                    "url": entry.get("link", ""),
                    "source": source,
                    "author": entry.get("author", entry.get("dc_creator", "unknown")),
                    "score_hn": 0,
                    "timestamp": None,
                    "text": entry.get("summary", entry.get("description", ""))
                })
            print(f"  Retrieved {limit} stories from {source}")
        except Exception as e:
            print(f"  Error fetching {source}: {e}")

    return stories


def fetch_benchmarks(limit=STORIES_PER_SOURCE):
    """Fetch AI model benchmark updates and leaderboard changes."""
    print(f"\n{'='*50}")
    print(f"Fetching benchmark updates...")
    print(f"{'='*50}")

    stories = []

    # Hugging Face Trending Models via API
    try:
        hf_api = "https://huggingface.co/api/models?sort=likes&direction=-1&limit=15"
        response = requests.get(hf_api, timeout=10, headers={"User-Agent": "Mozilla/5.0"})
        if response.ok:
            models = response.json()
            hf_count = 0
            for model in models[:limit]:
                model_name = model.get("modelId", "Unknown")
                tags = model.get("tags", [])
                pipeline_tag = model.get("pipeline_tag", "")
                # Only include LLM-related models
                if pipeline_tag == "text-generation" or any(t in str(tags).lower() for t in ["llm", "text-generation"]):
                    stories.append({
                        "title": f"🤗 Trending: {model_name}",
                        "url": f"https://huggingface.co/{model_name}",
                        "source": "Hugging Face Benchmarks",
                        "author": model.get("author", "unknown"),
                        "score_hn": model.get("likes", 0),
                        "timestamp": None,
                        "text": f"Pipeline: {pipeline_tag} | Tags: {', '.join(str(t) for t in tags[:5])}"
                    })
                    hf_count += 1
            print(f"  Retrieved {hf_count} models from Hugging Face")
    except Exception as e:
        print(f"  Error fetching Hugging Face benchmarks: {e}")

    # Hugging Face Daily Papers (ML/AI papers with trends)
    try:
        hf_papers = "https://huggingface.co/papers/rss"
        feed = feedparser.parse(hf_papers)
        hf_papers_count = 0
        for entry in feed.entries[:limit]:
            stories.append({
                "title": f"📄 HF Papers: {entry.get('title', '')}",
                "url": entry.get("link", ""),
                "source": "Hugging Face Papers",
                "author": entry.get("author", "unknown"),
                "score_hn": 0,
                "timestamp": None,
                "text": entry.get("summary", "")[:300]
            })
            hf_papers_count += 1
        print(f"  Retrieved {hf_papers_count} papers from Hugging Face Daily")
    except Exception as e:
        print(f"  Error fetching Hugging Face Papers: {e}")

    # LMSys LMArena updates (via their blog)
    try:
        lmsys_blog = "https://lmsys.org/blog/feed.xml"
        feed = feedparser.parse(lmsys_blog)
        lmsys_count = 0
        for entry in feed.entries[:5]:
            title = entry.get("title", "")
            # Include all LMSys blog posts (they're mostly benchmark/arena related)
            stories.append({
                "title": f"🏆 LMArena: {title}",
                "url": entry.get("link", ""),
                "source": "LMSys LMArena",
                "author": "LMSys",
                "score_hn": 0,
                "timestamp": None,
                "text": entry.get("summary", "")[:300]
            })
            lmsys_count += 1
        if lmsys_count > 0:
            print(f"  Retrieved {lmsys_count} updates from LMSys LMArena")
        else:
            print(f"  LMSys feed empty - skipping")
    except Exception as e:
        print(f"  Error fetching LMSys: {e}")

    # Papers With Code - Latest ML papers
    try:
        pwc_api = "https://paperswithcode.com/api/v1/papers/?page=1&page_size=10"
        response = requests.get(pwc_api, timeout=10, headers={"User-Agent": "Mozilla/5.0"})
        if response.ok:
            data = response.json()
            pwc_count = 0
            for paper in data.get("results", [])[:limit]:
                title = paper.get("title", "Unknown Paper")
                abstract = paper.get("abstract", "")[:300]
                url = paper.get("url", "")
                if url:
                    stories.append({
                        "title": f"🔬 PWC: {title}",
                        "url": url,
                        "source": "Papers With Code",
                        "author": "Research Community",
                        "score_hn": 0,
                        "timestamp": None,
                        "text": abstract
                    })
                    pwc_count += 1
            print(f"  Retrieved {pwc_count} papers from Papers With Code")
    except Exception as e:
        print(f"  Error fetching Papers With Code: {e}")

    return stories


def fetch_lobsters(limit=STORIES_PER_SOURCE):
    """Fetch stories from Lobsters."""
    print(f"\n{'='*50}")
    print(f"Fetching stories from Lobsters...")
    print(f"{'='*50}")

    stories = []

    try:
        feed = feedparser.parse(LOBSTERS_URL)
        for entry in feed.entries[:limit]:
            stories.append({
                "title": entry.get("title", ""),
                "url": entry.get("link", ""),
                "source": "Lobsters",
                "author": entry.get("author", "unknown"),
                "score_hn": 0,
                "timestamp": None,
                "text": entry.get("summary", "")
            })
        print(f"  Retrieved {len(stories)} stories from Lobsters")
    except Exception as e:
        print(f"  Error fetching Lobsters: {e}")

    return stories


def score_and_extract_bullets(story_title, story_text="", source=""):
    """
    Use AI to score relevance (1-10) and extract 3 bullet points.
    Returns: (score, bullet_points) or (None, None) on error.
    """
    prompt = f"""Analyze this tech news story for relevance and quality.

SOURCE: {source}
TITLE: {story_title}
CONTENT: {story_text[:500] if story_text else "No additional content"}

Respond ONLY with valid JSON in this exact format:
{{
  "score": <integer 1-10>,
  "bullet_points": ["point 1", "point 2", "point 3"]
}}

Score criteria:
- 8-10: Major AI/ML breakthrough, significant tech news, important industry shift
- 5-7: Moderate tech relevance, interesting discussion, niche topic
- 1-4: Off-topic, spam, non-tech content, clickbait

Extract 3 concise bullet points summarizing key information."""

    # Check if AI is configured
    if not AZURE_ENDPOINT or not AZURE_API_KEY:
        print("  Warning: AI not configured. Using fallback keyword scoring.")
        return fallback_score(story_title, story_text)

    # Detect API type based on endpoint URL
    if "aigateway.techvify.dev" in AZURE_ENDPOINT:
        # Techvify AI Gateway format (OpenAI-compatible)
        api_url = f"{AZURE_ENDPOINT.rstrip('/')}"
        payload = {
            "model": AZURE_DEPLOYMENT,
            "messages": [
                {"role": "system", "content": "You are a tech news analyst. Output ONLY valid JSON."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.3,
            "max_tokens": 500
        }
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {AZURE_API_KEY}"
        }
    else:
        # Azure OpenAI format
        api_url = f"{AZURE_ENDPOINT.rstrip('/')}/openai/deployments/{AZURE_DEPLOYMENT}/chat/completions?api-version=2023-05-15"
        payload = {
            "messages": [
                {"role": "system", "content": "You are a tech news analyst. Output ONLY valid JSON."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.3,
            "max_tokens": 500
        }
        headers = {
            "Content-Type": "application/json",
            "api-key": AZURE_API_KEY
        }

    try:
        response = requests.post(api_url, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
        result = response.json()
        content = result["choices"][0]["message"]["content"].strip()

        # Parse JSON from response (handle potential markdown code blocks)
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        content = content.strip()

        data = json.loads(content)
        score = int(data.get("score", 0))
        bullets = data.get("bullet_points", [])[:3]

        return score, bullets
    except Exception as e:
        print(f"  AI processing error for '{story_title[:30]}...': {e}")
        return None, None


def fallback_score(story_title, story_text=""):
    """
    Fallback keyword-based scoring when AI is not available.
    Returns: (score, bullet_points)
    """
    tech_keywords = [
        "ai", "artificial intelligence", "machine learning", "ml", "llm", "gpt",
        "neural", "deep learning", "nlp", "transformer", "model", "inference",
        "api", "cloud", "devops", "kubernetes", "docker", "serverless",
        "security", "breach", "vulnerability", "oauth", "authentication",
        "python", "javascript", "typescript", "react", "next.js", "rust", "go",
        "database", "sql", "nosql", "postgres", "mongodb", "redis",
        "aws", "azure", "gcp", "vercel", "netlify", "openai", "anthropic"
    ]

    content = f"{story_title} {story_text}".lower()
    match_count = sum(1 for keyword in tech_keywords if keyword in content)

    # Score based on keyword matches (0-5 keywords = 3-8 score)
    score = min(10, max(1, 3 + match_count))

    # Generate simple bullet points from title
    bullet_points = [
        f"Title: {story_title[:80]}",
        "AI analysis unavailable - using keyword scoring",
        f"Matched {match_count} tech keywords"
    ]

    return score, bullet_points


def main():
    print("=" * 60)
    print("Zero-cost AI News Aggregator - Multi-Source Scraper")
    print("=" * 60)

    all_stories = []

    # Fetch order: Benchmarks first, then AI blogs, then tech news, then community
    all_stories.extend(fetch_benchmarks())     # LMArena, Hugging Face, Papers With Code, Artificial Analysis
    all_stories.extend(fetch_ai_blogs())       # Anthropic, OpenAI, Ollama, etc.
    all_stories.extend(fetch_rss_feeds())      # TechCrunch, Verge, Ars, HF Papers
    all_stories.extend(fetch_hacker_news())    # Hacker News
    all_stories.extend(fetch_reddit_stories()) # Reddit (r/technology, r/programming, r/MachineLearning)
    all_stories.extend(fetch_lobsters())       # Lobsters

    print(f"\n{'='*60}")
    print(f"Total stories fetched: {len(all_stories)}")
    print(f"{'='*60}")

    # Process and score stories
    processed_stories = []

    # Benchmark sources get a score boost since they're inherently relevant
    BENCHMARK_SOURCES = ["Hugging Face Benchmarks", "Hugging Face Papers", "LMSys LMArena", "Papers With Code"]

    for idx, story in enumerate(all_stories, 1):
        print(f"\n[{idx}/{len(all_stories)}] Processing: {story['title'][:50]}...")

        # AI processing
        ai_score, bullet_points = score_and_extract_bullets(
            story["title"],
            story["text"],
            story["source"]
        )

        if ai_score is None:
            print("  Skipping - AI processing failed")
            continue

        # Boost benchmark scores by +2 (they're inherently relevant)
        if story["source"] in BENCHMARK_SOURCES:
            ai_score = min(10, ai_score + 2)
            print(f"  AI Score: {ai_score}/10 (boosted from benchmark) | Source: {story['source']}")
        else:
            print(f"  AI Score: {ai_score}/10 | Source: {story['source']}")

        # Filter by minimum score
        if ai_score >= MIN_SCORE:
            processed_stories.append({
                "id": idx,
                "title": story["title"],
                "url": story["url"],
                "source": story["source"],
                "author": story["author"],
                "timestamp": story["timestamp"],
                "ai_score": ai_score,
                "bullet_points": bullet_points
            })
            print(f"  ✓ Included (score >= {MIN_SCORE})")
        else:
            print(f"  ✗ Filtered out (score < {MIN_SCORE})")

    # Sort by AI score descending
    processed_stories.sort(key=lambda x: x["ai_score"], reverse=True)

    # Save to data.json
    output_data = {
        "generated_at": datetime.now().isoformat(),
        "total_stories": len(processed_stories),
        "sources": list(set(s["source"] for s in all_stories)),
        "stories": processed_stories
    }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)

    # Also copy to public folder for frontend
    public_path = Path(__file__).parent / OUTPUT_FILE_PUBLIC
    if public_path.exists():
        with open(public_path, "w", encoding="utf-8") as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)
        print(f"\nCopied to {OUTPUT_FILE_PUBLIC}")

    print(f"\n{'='*60}")
    print(f"Complete! Saved {len(processed_stories)} stories to {OUTPUT_FILE}")
    print(f"Sources: {', '.join(output_data['sources'])}")
    print(f"{'='*60}")

    return processed_stories


if __name__ == "__main__":
    main()
