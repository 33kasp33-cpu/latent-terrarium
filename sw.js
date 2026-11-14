const CACHE_NAME = 'latent-terrarium-v1.1';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './terrarium.css',
  './terrarium.js',
  './lang-ja.js',
  './lang-en.js',
  './icon.svg',
  './en/',
  './en/index.html',
  './en/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res && res.ok && new URL(event.request.url).origin === self.location.origin) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => {});
        }
        return res;
      })
      .catch(() =>
        caches.match(event.request).then((hit) => {
          if (hit) return hit;
          const isEn = /\/en(\/|$)/.test(new URL(event.request.url).pathname);
          return caches.match(isEn ? './en/index.html' : './index.html');
        })
      )
  );
});
