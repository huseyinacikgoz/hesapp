const CACHE_NAME = 'hesapp-v1.3.99';
const URLS_TO_CACHE = [
  './',
  'index.html',
  'css/style.css',
  'js/main.js',
  'js/calculator/calculator.js',
  'js/pwa.js',
  'js/splash.js',
  'js/theme.js',
  'js/toast.js',
  'js/vault/crypto.js',
  'js/vault/vault.js',
  'js/vault/ui/utils.js',
  'js/vault/ui/modal-manager.js',
  'js/vault/ui/info-modals.js',
  'js/vault/ui/settings-modals.js',
  'js/vault/ui/vault-list.js',
  'js/vault/ui/vault-access.js',
  'js/vault/ui/message-editor.js',
  'favicon/favicon.ico',
  'favicon/apple-touch-icon.png',
  'favicon/favicon-32x32.png',
  'favicon/favicon-16x16.png',
  'favicon/site.webmanifest',
  'favicon/android-chrome-192x192.png',
  'favicon/android-chrome-512x512.png'
];

// Install adımı: Dosyaları önbelleğe al
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing v1.3.99...');
  // Yeni SW'nin bekleme süresini atlayıp hemen aktifleşmesini sağla
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Fetch adımı: Network First (Önce Ağ, Sonra Önbellek) stratejisi
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Ağdan başarılı yanıt geldi
        // Önbelleği güncelle
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      })
      .catch(async () => {
        // Ağ hatası (çevrimdışı) - Önbellekten döndür
        const cachedResponse = await caches.match(event.request);

        if (cachedResponse) {
          return cachedResponse;
        }

        // Cache'te yoksa ve navigation isteği ise, index.html döndür (SPA desteği)
        if (event.request.mode === 'navigate') {
          const indexResponse = await caches.match('./index.html');
          if (indexResponse) {
            return indexResponse;
          }
        }

        // Cache'te yoksa offline response döndür
        return new Response(
          '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Çevrimdışı</title></head><body style="font-family:system-ui;text-align:center;padding:50px;"><h1>📵 Çevrimdışısınız</h1><p>İnternet bağlantınızı kontrol edin ve sayfayı yenileyin.</p></body></html>',
          {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/html; charset=utf-8'
            })
          }
        );
      })
  );
});

// Activate adımı: Eski önbellekleri temizle
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating v1.3.99...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Eğer bu cache adı whitelist'te değilse, sil.
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      ).then(() => {
        console.log('[Service Worker] Old caches cleared');
        console.log('[Service Worker] v1.3.99 is now active');
      });
    })
  );
  // Aktif olduğunda tüm istemcilerin kontrolünü hemen ele al.
  event.waitUntil(self.clients.claim());
});