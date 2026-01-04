const CACHE_NAME = 'etm-v3.1.1.11-cache';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});