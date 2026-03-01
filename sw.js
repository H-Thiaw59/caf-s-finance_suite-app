/**
 * CAFÉS-FINANCE × GHP — Service Worker
 * TINI/SYSTEME v1.0 · Phase Pilote
 * Stratégie: Cache-First avec Network Fallback
 */

const CACHE_NAME   = 'cafes-finance-v1.0.0';
const ASSETS_CACHE = 'cafes-assets-v1.0.0';

// Ressources à mettre en cache lors de l'installation
const PRECACHE = [
  './index.html',
  './css/style.css',
  './js/app.js',
  './manifest.json',
  './icons/icon-192.svg',
  './icons/icon-512.svg'
];

// CDN externes (Chart.js, Fonts) — Network-first avec fallback cache
const CDN_HOSTS = [
  'cdnjs.cloudflare.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com'
];

// ── Installation ─────────────────────────────────────────
self.addEventListener('install', event => {
  console.log('[SW] Installation TINI/SYSTEME v1.0');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Pré-cache des ressources locales');
        return cache.addAll(PRECACHE);
      })
      .then(() => self.skipWaiting())
      .catch(err => console.warn('[SW] Pré-cache partiel:', err))
  );
});

// ── Activation ───────────────────────────────────────────
self.addEventListener('activate', event => {
  console.log('[SW] Activation — nettoyage anciens caches');
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k !== CACHE_NAME && k !== ASSETS_CACHE)
          .map(k => {
            console.log('[SW] Suppression ancien cache:', k);
            return caches.delete(k);
          })
      ))
      .then(() => self.clients.claim())
  );
});

// ── Interception des requêtes ─────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') return;

  // Ignorer les requêtes Chrome extension
  if (url.protocol === 'chrome-extension:') return;

  // Stratégie CDN : Network-first → Cache → Offline
  if (CDN_HOSTS.some(h => url.hostname.includes(h))) {
    event.respondWith(networkFirstCDN(request));
    return;
  }

  // Stratégie ressources locales : Cache-first → Network → Offline
  event.respondWith(cacheFirst(request));
});

// Cache-first (ressources locales)
async function cacheFirst(request) {
  try {
    const cached = await caches.match(request);
    if (cached) return cached;

    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    // Fallback hors ligne
    const cached = await caches.match(request);
    if (cached) return cached;

    // Page hors ligne
    return new Response(
      `<!DOCTYPE html>
      <html lang="fr">
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
      <title>CAFÉS-FINANCE · Hors ligne</title>
      <style>body{background:#050A06;color:#F0F4F1;font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;text-align:center;padding:24px}
      h1{color:#D4A017;font-size:2rem;margin-bottom:16px}.ico{font-size:4rem;margin-bottom:16px}
      p{color:#8FA898;max-width:320px;line-height:1.7}.code{color:#16A870;font-family:monospace;font-size:1.2rem}
      </style></head>
      <body>
        <div class="ico">📵</div>
        <h1>Mode Hors Ligne</h1>
        <p>Votre connexion est interrompue.<br>Vos données locales sont préservées.<br>La synchronisation reprendra automatiquement.</p>
        <p class="code" style="margin-top:20px">*785# · USSD toujours disponible</p>
      </body></html>`,
      { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}

// Network-first (CDN)
async function networkFirstCDN(request) {
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(ASSETS_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    return cached || new Response('', { status: 503 });
  }
}

// ── Messages (sync, push) ─────────────────────────────────
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// ── Background sync ───────────────────────────────────────
self.addEventListener('sync', event => {
  if (event.tag === 'sync-transactions') {
    console.log('[SW] Sync transactions TINI en attente…');
    // Future: synchroniser avec l'API TINI/SYSTEME backend
  }
});

console.log('[SW] CAFÉS-FINANCE TINI/SYSTEME Service Worker chargé ✓');
