const CACHE_PREFIX = `earthtrip:${new URL(self.registration.scope).pathname}:`;
const CACHE = `${CACHE_PREFIX}v2`;
const resource = path => new URL(path, self.registration.scope).href;
const SHELL = ['offline.html', 'icon.svg', 'icons/icon-192.png', 'icons/icon-512.png'].map(resource);
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  // Do not cache authenticated pages, API responses, third-party maps, or live video.
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match(resource('offline.html'))));
  } else if (SHELL.includes(url.href)) {
    event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
  }
});
