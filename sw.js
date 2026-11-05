/* Squad Noobs service worker: offline reading and faster repeat visits.
   Bump VERSION whenever you change site files so visitors get the update. */
const VERSION = 'v2';
const CACHE = 'squad-noobs-' + VERSION;

// Pages and scripts saved on first visit, so the site opens offline.
const CORE = [
  'comics.html', 'characters.html', 'faq.html', 'support.html', 'privacy.html', 'terms.html', 'accessibility.html',
  'accessibility.js', 'manifest.webmanifest', 'icon-192.png',
  'data/chapter1.js', 'data/chapter2.js', 'data/chapter3.js', 'data/chapter4.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      // addAll is all-or-nothing, so add one by one and ignore missing files.
      .then((cache) => Promise.all(CORE.map((url) => cache.add(url).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('squad-noobs-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || req.headers.has('range') || /\.(mp4|webm|mp3)$/i.test(new URL(req.url).pathname)) return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === location.origin;
  const trusted = ['fonts.googleapis.com', 'fonts.gstatic.com', 'cdn.tailwindcss.com'].includes(url.hostname);
  if (!sameOrigin && !trusted) return;

  // Pages: network first, fall back to the saved copy (or the comic page) when offline.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return res; })
        .catch(() => caches.match(req).then((hit) => hit || caches.match('comics.html')))
    );
    return;
  }

  // Everything else (images, scripts, fonts): saved copy first, then update it in the background.
  event.respondWith(
    caches.match(req).then((hit) => {
      const fresh = fetch(req)
        .then((res) => { if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); } return res; })
        .catch(() => hit);
      return hit || fresh;
    })
  );
});