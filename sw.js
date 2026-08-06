/* 고전 사활 문제풀기 — 서비스워커
   HTML은 항상 서버에서 직접 가져옴 (캐시 완전 무시)
   정적 파일(아이콘 등)은 cache-first. */
const CACHE = 'gojeon-sahwal-v27';
const ASSETS = [
  'manifest.json',
  'icon-192.png',
  'icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const req = e.request;
  const url = new URL(req.url);
  const isHTML = req.mode === 'navigate'
    || req.destination === 'document'
    || url.pathname === '/'
    || url.pathname.endsWith('/')
    || url.pathname.endsWith('.html');

  if (isHTML) {
    // HTML은 캐시 완전 무시하고 항상 서버에서 직접 가져옴
    e.respondWith(
      fetch(req, { cache: 'no-store' }).then((res) => {
        return res;
      }).catch(() => caches.match('index.html'))
    );
    return;
  }

  // 정적 파일: cache-first
  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res && res.status === 200 && res.type === 'basic') {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
      }
      return res;
    }).catch(() => caches.match('index.html')))
  );
});