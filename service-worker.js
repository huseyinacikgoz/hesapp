const CACHE_NAME = 'hesapp-cache-v1.3.7';
const URLS_TO_CACHE = [
  '/',
  'index.html',
  'css/style.css',
  'js/main.js',
  'js/calculator/calculator.js',
  'js/pwa.js',
  'js/splash.js',
  'js/theme.js',
  'js/toast.js',
  'js/vault/crypto.js',
  'js/vault/ui.js',
  'js/vault/vault.js',
  'favicon/favicon.ico',
  'favicon/apple-touch-icon.png',
  'favicon/favicon-32x32.png',
  'favicon/favicon-16x16.png',
  'favicon/site.webmanifest',
  'favicon/android-chrome-192x192.png',
  'favicon/android-chrome-512x512.png'
];
 
// Kurulum (Install) adımı: Önbelleği oluştur ve dosyaları ekle
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Not: addAll atomik bir işlemdir. Herhangi bir dosya indirilemezse, tüm işlem başarısız olur.
        return cache.addAll(URLS_TO_CACHE).then(() => {
          // Kurulum tamamlandığında, bekleme adımını atla ve hemen aktivasyona geç.
          // Bu, 'controllerchange' olayını tetikler ve istemcinin sayfayı yenilemesini sağlar.
          return self.skipWaiting();
        });
      })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

// Fetch adımı: İstekleri yakala ve önbellekten sun
self.addEventListener('fetch', event => {
  // Sadece GET isteklerini işle
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Önbellekte varsa, önbellekten döndür
        if (response) {
          return response;
        }

        // Önbellekte yoksa, ağdan iste.
        // Önemli: fetch'ten dönen yanıtı hem tarayıcıya gönder hem de önbelleğe ekle.
        // Bu, uygulama ilk kez çevrimdışı açıldığında eksik kalabilecek
        // (örneğin Google Fonts gibi) kaynakların daha sonra önbelleğe alınmasını sağlar.
        return fetch(event.request).then(networkResponse => {
            // İsteği klonla çünkü bir response sadece bir kez kullanılabilir.
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
            return networkResponse;
        });
      })
  );
});

// Activate adımı: Eski önbellekleri temizle (ilerideki sürümler için)
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Eğer bu cache adı whitelist'te değilse, sil.
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Aktif olduğunda tüm istemcilerin kontrolünü hemen ele al.
  event.waitUntil(self.clients.claim());
});