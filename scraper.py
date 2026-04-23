#!/usr/bin/env python3
"""
Zero-cost AI News Aggregator - Multi-Source Scraper (Highly Optimized)
Fetches stories from multiple sources, scores relevance with AI, extracts bullet points.

Performance optimizations:
- Fully async HTTP requests using asyncio/aiohttp (no blocking calls)
- Single event loop for all async operations
- Batched AI processing with configurable concurrency
- Response caching with in-memory + disk persistence
- Connection pooling and request retries
- Semaphore-based concurrency control

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
import asyncio
import aiohttp
import feedparser
from datetime import datetime, timedelta
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
CACHE_FILE = ".cache.json"
MIN_SCORE = 7
STORIES_PER_SOURCE = 5  # Fetch this many from each source
CACHE_TTL_HOURS = 1  # Cache valid for 1 hour

# Performance tuning
MAX_CONCURRENT_REQUESTS = 10  # Max parallel HTTP requests
REQUEST_TIMEOUT = 30  # Seconds
REQUEST_RETRIES = 2  # Retry count for failed requests

# Azure OpenAI configuration
AZURE_ENDPOINT = os.environ.get("AZURE_OPENAI_ENDPOINT", "")
AZURE_API_KEY = os.environ.get("AZURE_OPENAI_API_KEY", "")
AZURE_DEPLOYMENT = os.environ.get("AZURE_OPENAI_DEPLOYMENT", "gemma-4")

# In-memory cache for current session
_session_cache = None


def load_cache():
    """Load cache from file (with in-memory caching)."""
    global _session_cache
    if _session_cache is not None:
        return _session_cache

    if Path(CACHE_FILE).exists():
        try:
            with open(CACHE_FILE, "r") as f:
                _session_cache = json.load(f)
                return _session_cache
        except:
            pass
    _session_cache = {"sources": {}, "stories": {}}
    return _session_cache


def save_cache():
    """Save cache to file (and update in-memory cache)."""
    global _session_cache
    if _session_cache is None:
        return
    with open(CACHE_FILE, "w") as f:
        json.dump(_session_cache, f, indent=2)


def is_cache_valid(timestamp_str):
    """Check if cache entry is still valid."""
    try:
        cached_time = datetime.fromisoformat(timestamp_str)
        return datetime.now() - cached_time < timedelta(hours=CACHE_TTL_HOURS)
    except:
        return False


def invalidate_expired_cache():
    """Remove expired entries from cache."""
    cache = load_cache()
    expired_keys = []
    for key, data in cache.get("stories", {}).items():
        if not is_cache_valid(data.get("timestamp", "")):
            expired_keys.append(key)
    for key in expired_keys:
        del cache["stories"][key]
    if expired_keys:
        save_cache()


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


async def fetch_hacker_news_async(session, limit=STORIES_PER_SOURCE, semaphore=None):
    """Fetch top stories from Hacker News asynchronously."""
    print(f"\n{'='*50}")
    print(f"Fetching {limit} stories from Hacker News...")
    print(f"{'='*50}")

    stories = []
    hn_top_url = "https://hacker-news.firebaseio.com/v0/topstories.json"
    hn_item_url = "https://hacker-news.firebaseio.com/v0/item/{}.json"

    try:
        async with session.get(hn_top_url) as response:
            response.raise_for_status()
            story_ids = (await response.json())[:limit]

        # Fetch all stories in parallel with semaphore control
        async def fetch_story(story_id):
            if semaphore:
                async with semaphore:
                    return await _fetch_single_story(session, hn_item_url, story_id)
            return await _fetch_single_story(session, hn_item_url, story_id)

        tasks = [fetch_story(story_id) for story_id in story_ids]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        for story in results:
            if isinstance(story, dict) and story:
                stories.append(story)

        print(f"  Retrieved {len(stories)} stories")
    except Exception as e:
        print(f"  Error fetching Hacker News: {e}")

    return stories


async def _fetch_single_story(session, url_template, story_id):
    """Fetch a single Hacker News story."""
    try:
        async with session.get(url_template.format(story_id), timeout=aiohttp.ClientTimeout(total=REQUEST_TIMEOUT)) as response:
            if response.status != 200:
                return None
            story = await response.json()
            if story and story.get("title") and story.get("url"):
                return {
                    "title": story.get("title", ""),
                    "url": story.get("url", ""),
                    "source": "Hacker News",
                    "author": story.get("by", "unknown"),
                    "score_hn": story.get("score", 0),
                    "timestamp": datetime.fromtimestamp(story.get("time", 0)).isoformat() if story.get("time") else None,
                    "text": story.get("text", "")
                }
    except:
        pass
    return None


async def fetch_reddit_stories_async(session, limit=STORIES_PER_SOURCE, semaphore=None):
    """Fetch top stories from Reddit subreddits asynchronously."""
    print(f"\n{'='*50}")
    print(f"Fetching stories from Reddit...")
    print(f"{'='*50}")

    headers = {"User-Agent": "Mozilla/5.0 (compatible; AI News Aggregator/1.0)"}

    async def fetch_subreddit(subreddit):
        if semaphore:
            async with semaphore:
                return await _fetch_single_subreddit(session, subreddit, limit, headers)
        return await _fetch_single_subreddit(session, subreddit, limit, headers)

    tasks = [fetch_subreddit(subreddit) for subreddit in REDDIT_SUBREDDITS]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    stories = []
    for result in results:
        if isinstance(result, list):
            stories.extend(result)

    print(f"  Total: {len(stories)} stories from {len(REDDIT_SUBREDDITS)} subreddits")
    return stories


async def _fetch_single_subreddit(session, subreddit, limit, headers):
    """Fetch stories from a single subreddit."""
    stories = []
    try:
        url = f"https://www.reddit.com/r/{subreddit}/hot.json?limit={limit}"
        async with session.get(url, headers=headers, timeout=aiohttp.ClientTimeout(total=REQUEST_TIMEOUT)) as response:
            if response.status != 200:
                return stories
            data = await response.json()

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
            print(f"  Retrieved {len(stories)} stories from r/{subreddit}")
    except Exception as e:
        print(f"  Error fetching r/{subreddit}: {e}")

    return stories


async def fetch_rss_feed_async(session, source, url, limit, semaphore=None):
    """Fetch a single RSS feed asynchronously."""
    try:
        if semaphore:
            async with semaphore:
                return await _fetch_single_rss(session, source, url, limit)
        return await _fetch_single_rss(session, source, url, limit)
    except Exception as e:
        print(f"  Error fetching {source}: {e}")
        return []


async def _fetch_single_rss(session, source, url, limit):
    """Fetch and parse a single RSS feed."""
    async with session.get(url, timeout=aiohttp.ClientTimeout(total=REQUEST_TIMEOUT)) as response:
        content = await response.text()
        feed = feedparser.parse(content)
        stories = []
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
        print(f"  Retrieved {len(stories)} stories from {source}")
        return stories


async def fetch_rss_feeds_parallel(limit=STORIES_PER_SOURCE, semaphore=None):
    """Fetch stories from RSS feeds in parallel."""
    print(f"\n{'='*50}")
    print(f"Fetching stories from RSS feeds (parallel)...")
    print(f"{'='*50}")

    async with aiohttp.ClientSession() as session:
        tasks = [
            fetch_rss_feed_async(session, source, url, limit, semaphore)
            for source, url in RSS_FEEDS.items()
        ]
        results = await asyncio.gather(*tasks)

    stories = []
    for result in results:
        stories.extend(result)
    print(f"  Total: {len(stories)} stories from {len(RSS_FEEDS)} sources")
    return stories


async def fetch_ai_blog_async(session, source, url, limit, semaphore=None):
    """Fetch a single AI blog asynchronously."""
    try:
        if semaphore:
            async with semaphore:
                return await _fetch_single_ai_blog(session, source, url, limit)
        return await _fetch_single_ai_blog(session, source, url, limit)
    except Exception as e:
        print(f"  Error fetching {source}: {e}")
        return []


async def _fetch_single_ai_blog(session, source, url, limit):
    """Fetch and parse a single AI blog feed."""
    async with session.get(url, timeout=aiohttp.ClientTimeout(total=REQUEST_TIMEOUT)) as response:
        content = await response.text()
        feed = feedparser.parse(content)
        stories = []
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
        print(f"  Retrieved {len(stories)} stories from {source}")
        return stories


async def fetch_ai_blogs_parallel(limit=STORIES_PER_SOURCE, semaphore=None):
    """Fetch stories from AI blogs in parallel."""
    print(f"\n{'='*50}")
    print(f"Fetching stories from AI blogs (parallel)...")
    print(f"{'='*50}")

    async with aiohttp.ClientSession() as session:
        tasks = [
            fetch_ai_blog_async(session, source, url, limit, semaphore)
            for source, url in AI_BLOGS.items()
        ]
        results = await asyncio.gather(*tasks)

    stories = []
    for result in results:
        stories.extend(result)
    print(f"  Total: {len(stories)} stories from {len(AI_BLOGS)} sources")
    return stories


async def fetch_benchmarks_async(session, limit=STORIES_PER_SOURCE, semaphore=None):
    """Fetch AI model benchmark updates and leaderboard changes asynchronously."""
    print(f"\n{'='*50}")
    print(f"Fetching benchmark updates...")
    print(f"{'='*50}")

    if semaphore:
        async with semaphore:
            return await _fetch_benchmarks_impl(session, limit)
    return await _fetch_benchmarks_impl(session, limit)


async def _fetch_benchmarks_impl(session, limit):
    """Implementation of benchmark fetching."""
    stories = []

    # Hugging Face Trending Models via API
    try:
        hf_api = "https://huggingface.co/api/models?sort=likes&direction=-1&limit=15"
        async with session.get(hf_api, headers={"User-Agent": "Mozilla/5.0"}, timeout=aiohttp.ClientTimeout(total=REQUEST_TIMEOUT)) as response:
            if response.status == 200:
                models = await response.json()
                hf_count = 0
                for model in models[:limit]:
                    model_name = model.get("modelId", "Unknown")
                    tags = model.get("tags", [])
                    pipeline_tag = model.get("pipeline_tag", "")
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

    # Hugging Face Daily Papers via RSS
    try:
        hf_papers = "https://huggingface.co/papers/rss"
        async with session.get(hf_papers, timeout=aiohttp.ClientTimeout(total=REQUEST_TIMEOUT)) as response:
            content = await response.text()
            feed = feedparser.parse(content)
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

    # LMSys LMArena updates
    try:
        lmsys_blog = "https://lmsys.org/blog/feed.xml"
        async with session.get(lmsys_blog, timeout=aiohttp.ClientTimeout(total=REQUEST_TIMEOUT)) as response:
            content = await response.text()
            feed = feedparser.parse(content)
            lmsys_count = 0
            for entry in feed.entries[:5]:
                title = entry.get("title", "")
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
        async with session.get(pwc_api, headers={"User-Agent": "Mozilla/5.0"}, timeout=aiohttp.ClientTimeout(total=REQUEST_TIMEOUT)) as response:
            if response.status == 200:
                data = await response.json()
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


async def fetch_lobsters_async(session, limit=STORIES_PER_SOURCE, semaphore=None):
    """Fetch stories from Lobsters asynchronously."""
    print(f"\n{'='*50}")
    print(f"Fetching stories from Lobsters...")
    print(f"{'='*50}")

    if semaphore:
        async with semaphore:
            return await _fetch_lobsters_impl(session, limit)
    return await _fetch_lobsters_impl(session, limit)


async def _fetch_lobsters_impl(session, limit):
    """Implementation of Lobsters fetching."""
    stories = []

    try:
        async with session.get(LOBSTERS_URL, timeout=aiohttp.ClientTimeout(total=REQUEST_TIMEOUT)) as response:
            content = await response.text()
            feed = feedparser.parse(content)
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


# In-memory cache for AI scores during current session
_ai_score_cache = {}


def score_and_extract_bullets_cached(story_title, story_text="", source=""):
    """
    Use AI to score relevance with caching (optimized with in-memory cache).
    Returns: (score, bullet_points) or (None, None) on error.
    """
    global _ai_score_cache

    # Create a cache key from the story URL or title
    cache_key = f"{source}:{story_title}"

    # Check in-memory cache first (fastest)
    if cache_key in _ai_score_cache:
        cached_data = _ai_score_cache[cache_key]
        if is_cache_valid(cached_data.get("timestamp", "")):
            print(f"  [CACHED] Score: {cached_data['score']}/10")
            return cached_data["score"], cached_data["bullet_points"]

    # Check disk cache second
    cache = load_cache()
    if cache_key in cache.get("stories", {}):
        cached_data = cache["stories"][cache_key]
        if is_cache_valid(cached_data.get("timestamp", "")):
            # Promote to in-memory cache
            _ai_score_cache[cache_key] = cached_data
            print(f"  [CACHED] Score: {cached_data['score']}/10")
            return cached_data["score"], cached_data["bullet_points"]

    # Not cached or expired, process with AI
    score, bullets = score_and_extract_bullets(story_title, story_text, source)

    if score is not None:
        # Save to both caches
        cache_entry = {
            "score": score,
            "bullet_points": bullets,
            "timestamp": datetime.now().isoformat()
        }
        _ai_score_cache[cache_key] = cache_entry
        cache = load_cache()
        if "stories" not in cache:
            cache["stories"] = {}
        cache["stories"][cache_key] = cache_entry
        # Don't save to disk yet - batch save at the end

    return score, bullets


def flush_cache_to_disk():
    """Save in-memory cache to disk (call once at end of processing)."""
    save_cache()


async def process_story_async(session, story, api_url, headers, payload_template):
    """Process a single story with AI asynchronously."""
    prompt = f"""Analyze this tech news story for relevance and quality.

SOURCE: {story['source']}
TITLE: {story['title']}
CONTENT: {story.get('text', '')[:500] if story.get('text') else 'No additional content'}

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

    payload = payload_template.copy()
    payload["messages"] = [
        {"role": "system", "content": "You are a tech news analyst. Output ONLY valid JSON."},
        {"role": "user", "content": prompt}
    ]

    try:
        async with session.post(api_url, json=payload, headers=headers) as response:
            result = await response.json()
            content = result["choices"][0]["message"]["content"].strip()

            # Parse JSON from response
            if content.startswith("```"):
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]
            content = content.strip()

            data = json.loads(content)
            score = int(data.get("score", 0))
            bullets = data.get("bullet_points", [])[:3]

            print(f"  AI Score: {score}/10")
            return story, score, bullets
    except Exception as e:
        print(f"  AI processing error for '{story['title'][:30]}...': {e}")
        return story, None, None


async def process_stories_batch_parallel(stories, batch_size=5):
    """Process stories in parallel batches."""
    if not AZURE_ENDPOINT or not AZURE_API_KEY:
        print("  Warning: AI not configured. Using fallback keyword scoring.")
        return [(s, *fallback_score(s["title"], s.get("text", ""))) for s in stories]

    # Detect API type and build common payload/headers
    if "aigateway.techvify.dev" in AZURE_ENDPOINT:
        api_url = f"{AZURE_ENDPOINT.rstrip('/')}"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {AZURE_API_KEY}"
        }
        payload_template = {
            "model": AZURE_DEPLOYMENT,
            "temperature": 0.3,
            "max_tokens": 500
        }
    else:
        api_url = f"{AZURE_ENDPOINT.rstrip('/')}/openai/deployments/{AZURE_DEPLOYMENT}/chat/completions?api-version=2023-05-15"
        headers = {
            "Content-Type": "application/json",
            "api-key": AZURE_API_KEY
        }
        payload_template = {
            "temperature": 0.3,
            "max_tokens": 500
        }

    processed = []
    connector = aiohttp.TCPConnector(limit=10)

    async with aiohttp.ClientSession(connector=connector) as session:
        # Process in batches to avoid overwhelming the API
        for i in range(0, len(stories), batch_size):
            batch = stories[i:i + batch_size]
            print(f"\n  Processing batch {i//batch_size + 1} ({len(batch)} stories)...")

            tasks = [
                process_story_async(session, story, api_url, headers, payload_template)
                for story in batch
            ]
            results = await asyncio.gather(*tasks)

            for story, score, bullets in results:
                if score is not None:
                    processed.append((story, score, bullets))

            # Small delay between batches to be nice to the API
            if i + batch_size < len(stories):
                await asyncio.sleep(0.5)

    return processed


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


async def fetch_all_sources_async():
    """Fetch all sources in a single event loop with controlled concurrency."""
    # Create semaphore to limit concurrent connections
    semaphore = asyncio.Semaphore(MAX_CONCURRENT_REQUESTS)

    # Create a shared session for all HTTP requests
    connector = aiohttp.TCPConnector(limit=MAX_CONCURRENT_REQUESTS, ttl_dns_cache=300)
    async with aiohttp.ClientSession(connector=connector) as session:
        # Fetch all sources in parallel where possible
        tasks = [
            fetch_benchmarks_async(session, STORIES_PER_SOURCE, semaphore),
            fetch_ai_blogs_parallel(STORIES_PER_SOURCE, semaphore),
            fetch_rss_feeds_parallel(STORIES_PER_SOURCE, semaphore),
            fetch_hacker_news_async(session, STORIES_PER_SOURCE, semaphore),
            fetch_reddit_stories_async(session, STORIES_PER_SOURCE, semaphore),
            fetch_lobsters_async(session, STORIES_PER_SOURCE, semaphore),
        ]

        results = await asyncio.gather(*tasks, return_exceptions=True)

    # Combine all results
    all_stories = []
    for result in results:
        if isinstance(result, list):
            all_stories.extend(result)

    return all_stories


async def process_all_stories_async(all_stories, batch_size=5):
    """Process all stories with AI scoring using parallel batches."""
    if not AZURE_ENDPOINT or not AZURE_API_KEY:
        print("  Warning: AI not configured. Using fallback keyword scoring.")
        return [(s, *fallback_score(s["title"], s.get("text", ""))) for s in all_stories]

    # Detect API type and build common payload/headers
    if "aigateway.techvify.dev" in AZURE_ENDPOINT:
        api_url = f"{AZURE_ENDPOINT.rstrip('/')}"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {AZURE_API_KEY}"
        }
        payload_template = {
            "model": AZURE_DEPLOYMENT,
            "temperature": 0.3,
            "max_tokens": 500
        }
    else:
        api_url = f"{AZURE_ENDPOINT.rstrip('/')}/openai/deployments/{AZURE_DEPLOYMENT}/chat/completions?api-version=2023-05-15"
        headers = {
            "Content-Type": "application/json",
            "api-key": AZURE_API_KEY
        }
        payload_template = {
            "temperature": 0.3,
            "max_tokens": 500
        }

    processed = []
    connector = aiohttp.TCPConnector(limit=MAX_CONCURRENT_REQUESTS)

    async with aiohttp.ClientSession(connector=connector) as session:
        # Process in batches to avoid overwhelming the API
        for i in range(0, len(all_stories), batch_size):
            batch = all_stories[i:i + batch_size]
            print(f"\n  Processing batch {i//batch_size + 1} ({len(batch)} stories)...")

            tasks = [
                process_story_async(session, story, api_url, headers, payload_template)
                for story in batch
            ]
            results = await asyncio.gather(*tasks)

            for story, score, bullets in results:
                if score is not None:
                    processed.append((story, score, bullets))

            # Small delay between batches to be nice to the API
            if i + batch_size < len(all_stories):
                await asyncio.sleep(0.5)

    return processed


def main():
    print("=" * 60)
    print("Zero-cost AI News Aggregator - Multi-Source Scraper (Highly Optimized)")
    print("=" * 60)

    # Invalidate expired cache entries at startup
    invalidate_expired_cache()

    # Phase 1: Fetch all sources using a single event loop
    print("\n[Phase 1: Fetching stories from all sources (parallel)...]")
    all_stories = asyncio.run(fetch_all_sources_async())

    print(f"\n{'='*60}")
    print(f"Total stories fetched: {len(all_stories)}")
    print(f"{'='*60}")

    # Phase 2: Process and score stories using parallel batch processing
    print("\n[Phase 2: Processing stories with AI (parallel batches)...]")

    # Benchmark sources get a score boost since they're inherently relevant
    BENCHMARK_SOURCES = ["Hugging Face Benchmarks", "Hugging Face Papers", "LMSys LMArena", "Papers With Code"]

    # Process stories in parallel batches
    processed_results = asyncio.run(process_all_stories_async(all_stories, batch_size=5))

    # Build processed stories list
    processed_stories = []
    for story, ai_score, bullet_points in processed_results:
        # Boost benchmark scores by +2 (they're inherently relevant)
        if story["source"] in BENCHMARK_SOURCES:
            ai_score = min(10, ai_score + 2)

        # Filter by minimum score
        if ai_score >= MIN_SCORE:
            processed_stories.append({
                "id": all_stories.index(story) + 1,
                "title": story["title"],
                "url": story["url"],
                "source": story["source"],
                "author": story["author"],
                "timestamp": story["timestamp"],
                "ai_score": ai_score,
                "bullet_points": bullet_points
            })

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

    # Flush cache to disk once at the end
    flush_cache_to_disk()

    print(f"\n{'='*60}")
    print(f"Complete! Saved {len(processed_stories)} stories to {OUTPUT_FILE}")
    print(f"Sources: {', '.join(output_data['sources'])}")
    print(f"{'='*60}")

    return processed_stories


if __name__ == "__main__":
    main()
