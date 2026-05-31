const CACHE = 'fireapp-v339';

const PRECACHE_FILES = [
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './assets/pets/mailpup/spritesheet.webp',
  './assets/pets/mailpup/references/running.png',
  './assets/pets/mailpup/references/saluting.png',
  './assets/pets/mailpup/references/eating.png',
  './assets/pets/mailpup/references/studying.png',
  './assets/pets/mailpup/references/dancing.png',
  './assets/pets/mailpup/references/pushup.png',
  './assets/pets/mailpup/references/sleeping.png',
  './assets/pets/mailpup/pet.json',
  './assets/pets/mailpup/summon.png',
  './assets/pets/mailpup/summon-face.png',
];

const NETWORK_FIRST = ['index.html', 'app.js', 'styles.css', 'manifest.json', 'facilities-data.js', 'facilities.js', 'holidays.json', 'chat streaming.html', 'intro.html', 'intro-mobile.html'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(PRECACHE_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then(clients => clients.forEach(c => c.postMessage({ type: 'CACHE_UPDATED' })))
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);
  const filename = decodeURIComponent(url.pathname.split('/').pop() || '');

  // NETWORK_FIRST 목록: 항상 네트워크에서 최신본을 받아오고, 실패 시에만 캐시로 폴백
  if (NETWORK_FIRST.includes(filename)) {
    e.respondWith(
      fetch(new Request(e.request.url, { cache: 'no-store' }))
        .then(res => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, copy));
          }
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // 그 외(이미지, PDF, 정적 자산 등): 캐시 우선, 없으면 네트워크에서 받아 캐시에 저장
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      });
    })
  );
});

