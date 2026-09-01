/* ───────────────────────────────────────────────────────────────
   PYROS — service worker, strategie "reseau d'abord"

   En ligne  : le navigateur va toujours chercher la derniere version.
   Hors ligne: il ressert la derniere page consultee.

   Change CACHE a chaque grosse mise a jour pour purger l'ancien cache.
   ─────────────────────────────────────────────────────────────── */
const CACHE = 'pyros-v1';

const PRECACHE = [
  './',
  './index.html',
  './favicon.ico',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './site.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .catch(() => null)
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // On ne touche qu'aux GET de meme origine : formulaires et
  // appels externes (Google Fonts, Apps Script) passent directement.
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match('./index.html')))
  );
});
