// PWA Güncelleme Mantığı
let newWorker;

function showUpdateBanner() {
    const updateBanner = document.getElementById('update-notification');
    const updateButton = document.getElementById('update-now-btn');
    
    updateBanner.style.display = 'flex';
    
    updateButton.addEventListener('click', () => {
        // Service Worker zaten skipWaiting() çağrısı yaptığı için,
        // controllerchange olayını bekleyip sayfayı yenilemek yeterlidir.
        updateButton.disabled = true;
    });
}

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
                if (typeof gtag === 'function') {
                    gtag('event', 'pwa_install_prompted', { 'event_category': 'PWA' });
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
        navigator.serviceWorker.register('/hesapp/service-worker.js').then(reg => {
            reg.addEventListener('updatefound', () => {
                newWorker = reg.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        showUpdateBanner();
                    }
                });
            });
        });

        navigator.serviceWorker.addEventListener('controllerchange', () => {
            // Yeni Service Worker kontrolü devraldığında, en son varlıkları
            // yüklemek için sayfayı yeniden yükle.
            window.location.reload();
        });
    }
    setupInstallButton();
}