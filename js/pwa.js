// PWA Güncelleme Mantığı
// Otomatik güncelleme yapıldığı için manuel banner kaldırıldı.
let newWorker;

// PWA Yükleme Mantığı
let deferredPrompt;

function setupInstallButton() {
    const installButton = document.getElementById('installAppBtn');
    const installOption = document.getElementById('infoInstallApp');

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        window.deferredPrompt = e;
        if (installButton) installButton.style.display = 'block';
        if (installOption) installOption.style.display = 'flex';
    });

    if (installButton) {
        installButton.addEventListener('click', async (e) => {
            e.preventDefault();
            if (window.deferredPrompt) {
                if (typeof umami !== 'undefined' && typeof umami.track === 'function') {
                    umami.track('pwa_install_prompted');
                }
                window.deferredPrompt.prompt();
                installButton.style.display = 'none';
                if (installOption) installOption.style.display = 'none';
                window.deferredPrompt = null;
            }
        });
    }
}

export function initPwa() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js').then(reg => {
            // Yeni bir service worker bulunduğunda
            reg.addEventListener('updatefound', () => {
                newWorker = reg.installing;
                newWorker.addEventListener('statechange', () => {
                    // Durum değiştiğinde (örneğin installed olduğunda)
                    // Service Worker'da skipWaiting() olduğu için otomatik aktifleşecek
                    // ve controllerchange tetiklenecek.
                });
            });
        });

        navigator.serviceWorker.addEventListener('controllerchange', () => {
            // Yeni Service Worker kontrolü devraldığında sayfayı yenile
            window.location.reload();
        });
    }
    setupInstallButton();
}