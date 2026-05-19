const CACHE = 'fireapp-v223';

const PRECACHE_FILES = [
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './assets/pets/mailpup/spritesheet.webp',
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

  // ?? ìŒ?????? ìŒ?? ??? ì™???? ì???? ì?ê²?? ìŒê½?ï§¤ì’–?Šå ?åª›Â€?? ìŒ?¤å ?(?? ì?ë´?? ìŒ????ï§?¨¯???? ìŒ??
  if (NETWORK_FIRST.includes(filename)) {
    e.respondWith(
      fetch(new Request(e.request.url, { cache: 'no-store' }))
        .then(res => {
          if (res && res.ok) {
            caches.open(CACHE).then(c => c.put(e.request, res.clone()));
          }
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // ?? ìˆ?§ï§? (?? ì™??ï§Â€, PDF, ?? ìŒ? é‡‰??œ­????: ï§?¨¯???? ìŒê½? ?? ìŒ?å ??? ì???? ì?ê²?? ìŒê½?è«›ì†ë¸?ï§?¨¯??
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res && res.ok) {
          caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        }
        return res;
      });
    })
  );
});


