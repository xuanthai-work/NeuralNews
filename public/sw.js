// NeuralNews service worker
// Caching strategy:
//   - Static assets (Next.js _next/static): cache-first (immutable, fingerprinted URLs)
//   - data.json:                            stale-while-revalidate
//   - HTML navigations:                     network-first, fall back to cache, fall back to /offline
//   - /api/scrape:                          network only (mutating)
//   - /api/* (other):                       network-first

const VERSION = "v1";
const STATIC_CACHE = `neuralnews-static-${VERSION}`;
const RUNTIME_CACHE = `neuralnews-runtime-${VERSION}`;
const PRECACHE_URLS = ["/", "/data.json", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS).catch(() => undefined))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== STATIC_CACHE && k !== RUNTIME_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

function isDataJson(url) {
  return url.pathname === "/data.json";
}

function isApiRoute(url) {
  return url.pathname.startsWith("/api/");
}

function isMutatingApi(url) {
  return url.pathname === "/api/scrape";
}

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/_next/image") ||
    /\.(woff2?|ttf|otf|png|jpg|jpeg|svg|gif|webp|ico|css|js)$/.test(url.pathname)
  );
}

async function staleWhileRevalidate(event, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(event.request);

  const network = fetch(event.request)
    .then((response) => {
      if (response.ok) cache.put(event.request, response.clone());
      return response;
    })
    .catch(() => cached);

  return cached || network;
}

async function networkFirst(event, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(event.request);
    if (response.ok && event.request.method === "GET") {
      cache.put(event.request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(event.request);
    if (cached) return cached;
    // For navigations, fall back to the cached home page
    if (event.request.mode === "navigate") {
      const fallback = await cache.match("/");
      if (fallback) return fallback;
    }
    throw new Error("Offline and no cached response available");
  }
}

async function cacheFirst(event, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(event.request);
  if (cached) return cached;
  const response = await fetch(event.request);
  if (response.ok) cache.put(event.request, response.clone());
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  if (url.origin !== self.location.origin) return;
  if (isMutatingApi(url)) return; // Let scraper trigger pass through to network

  if (isDataJson(url)) {
    event.respondWith(staleWhileRevalidate(event, RUNTIME_CACHE));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(event, STATIC_CACHE));
    return;
  }

  if (isApiRoute(url)) {
    event.respondWith(networkFirst(event, RUNTIME_CACHE));
    return;
  }

  // HTML navigations and everything else: network-first w/ cache fallback
  event.respondWith(networkFirst(event, RUNTIME_CACHE));
});
