const CACHE_NAME = 'mt-unipos-v5';

const CORE_ROUTES = [
  '/',
  '/dashboard',
  '/pos',
  '/sales',
  '/customers',
  '/products',
  '/suppliers',
  '/purchases',
  '/inventory',
  '/expenses',
  '/accounting',
  '/payroll',
  '/staff',
  '/crm',
  '/reports',
  '/ai',
  '/support',
  '/settings',
  '/restaurant',
  '/kds',
  '/menu-builder',
  '/floor-editor',
  '/pharmacy',
  '/hrms',
  '/sms',
  '/login'
];

const STATIC_ASSETS = [
  '/manifest.json',
  '/logo.png',
  '/logo light.png',
  '/Logo Dark.png',
  '/favicon.png',
  '/apple-icon.png',
  '/icon-192.png',
  '/icon.png'
];

// Helper: Extract and cache any JS/CSS assets referenced in HTML response
async function extractAndCacheAssets(htmlText, cache) {
  try {
    const scriptMatches = htmlText.matchAll(/src="(\/_next\/static\/[^"]+)"/g);
    for (const match of scriptMatches) {
      const assetUrl = match[1];
      try {
        const res = await fetch(assetUrl, { cache: 'no-cache' });
        if (res && res.status === 200) {
          await cache.put(assetUrl, res);
        }
      } catch (e) {}
    }
    const cssMatches = htmlText.matchAll(/href="(\/_next\/static\/[^"]+\.css)"/g);
    for (const match of cssMatches) {
      const assetUrl = match[1];
      try {
        const res = await fetch(assetUrl, { cache: 'no-cache' });
        if (res && res.status === 200) {
          await cache.put(assetUrl, res);
        }
      } catch (e) {}
    }
  } catch (err) {}
}

// Install Event: Precache all application routes, RSC payloads, and static assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // 1. Cache static assets
      await Promise.all(
        STATIC_ASSETS.map(async (url) => {
          try {
            const response = await fetch(url, { cache: 'no-cache' });
            if (response && response.status === 200) {
              await cache.put(url, response);
            }
          } catch (err) {}
        })
      );

      // 2. Cache all core HTML routes and their associated chunks
      for (const route of CORE_ROUTES) {
        try {
          const response = await fetch(route, { cache: 'no-cache' });
          if (response && response.status === 200) {
            const cloned = response.clone();
            await cache.put(route, response);
            const htmlText = await cloned.text();
            await extractAndCacheAssets(htmlText, cache);
          }
        } catch (err) {}

        // Precache RSC payload for Next.js client router
        try {
          const rscRes = await fetch(route, {
            headers: { 'RSC': '1' },
            cache: 'no-cache'
          });
          if (rscRes && rscRes.status === 200) {
            await cache.put(`${route}?_rsc=precache`, rscRes.clone());
            await cache.put(route + '__rsc__', rscRes);
          }
        } catch (err) {}
      }
    })
  );
});

// Activate Event: Clean up outdated caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Intelligent offline caching strategy
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET or cross-origin requests (e.g. Supabase, external APIs)
  if (event.request.method !== 'GET' || url.origin !== location.origin) return;

  // 1. Static Assets & Next.js Chunks (/_next/static/, images, fonts, icons) -> Cache First, fallback to Network
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|ico|json|woff|woff2|ttf|eot|js|css)$/)
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const resClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
            }
            return networkResponse;
          })
          .catch(() => caches.match(url.pathname));
      })
    );
    return;
  }

  // 2. Next.js RSC Payload Requests (_rsc search param or RSC header) -> Network First with cached fallback
  const isRscRequest = url.searchParams.has('_rsc') || event.request.headers.get('RSC') === '1';
  if (isRscRequest) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const resClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, resClone);
              cache.put(url.pathname + '__rsc__', networkResponse.clone());
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // 1. Exact match
          const cachedExact = await caches.match(event.request);
          if (cachedExact) return cachedExact;

          // 2. Pathname RSC match
          const cachedRsc = await caches.match(url.pathname + '__rsc__');
          if (cachedRsc) return cachedRsc;

          const cachedPre = await caches.match(`${url.pathname}?_rsc=precache`);
          if (cachedPre) return cachedPre;

          // 3. Match any known RSC response for this pathname from cache keys
          const cache = await caches.open(CACHE_NAME);
          const keys = await cache.keys();
          for (const key of keys) {
            const keyUrl = new URL(key.url);
            if (keyUrl.pathname === url.pathname && (keyUrl.searchParams.has('_rsc') || key.url.includes('__rsc__'))) {
              const matched = await cache.match(key);
              if (matched) return matched;
            }
          }

          // Return empty 200 response with RSC header rather than crashing client router with HTML
          return new Response('', {
            status: 200,
            headers: { 'Content-Type': 'text/x-component' }
          });
        })
    );
    return;
  }

  // 3. Navigation / HTML Page Requests -> Network First with robust cache & App Shell fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const resClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
          }
          return networkResponse;
        })
        .catch(async () => {
          // Exact request match
          const exact = await caches.match(event.request);
          if (exact) return exact;

          // Pathname match
          const pathMatch = await caches.match(url.pathname);
          if (pathMatch) return pathMatch;

          // Search in cache keys for matching pathname
          const cache = await caches.open(CACHE_NAME);
          const keys = await cache.keys();
          for (const key of keys) {
            const keyUrl = new URL(key.url);
            if (keyUrl.pathname === url.pathname) {
              const matched = await cache.match(key);
              if (matched) return matched;
            }
          }

          // App shell / Dashboard / POS fallback
          const fallback = (await caches.match('/dashboard')) || (await caches.match('/pos')) || (await caches.match('/'));
          if (fallback) return fallback;

          // Final offline page fallback
          return new Response(
            `<!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="utf-8" />
                <title>MT Core — Offline Mode</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <style>
                  body { background: #000; color: #fff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; text-align: center; }
                  .card { background: #111; border: 1px solid #222; border-radius: 16px; padding: 32px; max-width: 400px; }
                  .badge { display: inline-block; background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.4); padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; margin-bottom: 16px; }
                  h1 { font-size: 20px; font-weight: 900; margin: 0 0 8px; color: #fff; }
                  p { color: #94a3b8; font-size: 13px; margin: 0 0 24px; line-height: 1.5; }
                  .btn { display: inline-block; background: #0ea5e9; color: #000; font-weight: 800; font-size: 13px; text-decoration: none; padding: 12px 24px; border-radius: 10px; text-transform: uppercase; }
                </style>
              </head>
              <body>
                <div class="card">
                  <div class="badge">Offline Storage Active</div>
                  <h1>MT Core System Offline</h1>
                  <p>You are currently disconnected from the internet. All POS and ERP data remains fully accessible.</p>
                  <a class="btn" href="/pos">Open Cashier POS</a>
                </div>
              </body>
            </html>`,
            { headers: { 'Content-Type': 'text/html' } }
          );
        })
    );
    return;
  }

  // 4. Default GET Requests
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const resClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
