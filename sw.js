const CACHE = 'solitaire-v3';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
// cache:'reload' skips the browser's HTTP cache so a new version never stores stale copies.
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, {cache: 'reload'})))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
const keep = (req, res) => { if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; };
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // The page itself: network first so updates show up right away; cached copy when offline.
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request, {cache: 'no-cache'}).then(res => keep(e.request, res))
      .catch(() => caches.match(e.request, {ignoreSearch: true}).then(hit => hit || caches.match('index.html'))));
    return;
  }
  // Everything else (icons, fonts): cache first so it works offline.
  e.respondWith(caches.match(e.request, {ignoreSearch: true}).then(hit => hit || fetch(e.request).then(res => keep(e.request, res))));
});
