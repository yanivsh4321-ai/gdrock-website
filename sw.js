/* GDRock Compliance Console — service worker.
   Caches the console's own shell so the installed app opens offline, and touches
   nothing else. It used to answer every request on gdrock.com: other pages could be
   served stale from cache, and cross-origin scripts failed (the site's CSP blocks
   fetch() to other hosts from here), which broke pack.html for anyone who had opened
   the console. Live consent data (cdn.gdrock.com) is never cached. */
const VERSION = 'gdrock-app-v3'; // bump whenever app.html changes
const SHELL = [
  '/app.html',
  '/manifest.webmanifest',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/assets/icon-maskable-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Only the console's own shell. Everything else goes to the network untouched.
  if (url.origin !== self.location.origin || !SHELL.includes(url.pathname)) return;
  // Network first, so a deploy shows at once; the cached copy is the offline fallback.
  e.respondWith(
    fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(VERSION).then((c) => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(req))
  );
});
