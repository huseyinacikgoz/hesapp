const CACHE_NAME = 'hesapp-cache-v1.3.0';
const URLS_TO_CACHE = [
  '/',
  'index.html',
  'css/style.css?v=1.3.0',
  'js/script.js?v=1.3.0',
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
        return cache.addAll(URLS_TO_CACHE);
      })
      .then(() => {
        // Yeni Service Worker'ı hemen aktif etmeye zorlama, tarayıcının yönetmesine izin ver.
        // Güncelleme bildirimi için istemci tarafı kodu bunu yönetecek.
      })
  );
});

// Fetch adımı: İstekleri yakala ve önbellekten sun
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Önbellekte varsa, önbellekten döndür
        if (response) {
          return response;
        }
        // Önbellekte yoksa, ağdan iste ve döndür
        return fetch(event.request);
      }
    )
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
  // Aktif olduğunda tüm istemcilerin kontrolünü ele al
  return self.clients.claim();
});