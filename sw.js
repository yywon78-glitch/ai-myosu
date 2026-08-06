/* 怨좎쟾 ?ы솢 臾몄젣?湲????쒕퉬?ㅼ썙而?   HTML(index.html)? network-first: ?⑤씪?몄씠硫???긽 理쒖떊 踰꾩쟾 ?먮룞 諛섏쁺,
   ?ㅽ봽?쇱씤?대㈃ 罹먯떆濡??대갚. ?뺤쟻 ?뚯씪(?꾩씠肄???? cache-first. */
const CACHE = 'gojeon-sahwal-v22';
const ASSETS = [
  '.',
  'index.html',
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
    // network-first: ?⑤씪?몄씠硫?理쒖떊 HTML ???먮룞 媛깆떊, ?ㅽ봽?쇱씤?대㈃ 罹먯떆
    e.respondWith(
      fetch(req).then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => caches.match(req).then((r) => r || caches.match('index.html')))
    );
    return;
  }

  // ?뺤쟻 ?뚯씪: cache-first
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
