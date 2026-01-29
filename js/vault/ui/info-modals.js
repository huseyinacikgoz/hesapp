import {
    termsBackdrop, termsActions, TERMS_KEY,
    securityBackdrop, aboutBackdrop, howToUseBackdrop,
    infoBtn, resetModalScroll
} from './utils.js';

import { openVaultAccessMode } from './vault-access.js';

// --- Info Modals (Terms, Security, etc.) ---

let termsModalCloseCallback = null;
let securityModalCloseCallback = null;
let aboutModalCloseCallback = null;
let howToUseModalCloseCallback = null;

export function showTermsModal(isPreLogin = false, onCloseCallback = null) {
    termsModalCloseCallback = onCloseCallback;
    if (termsBackdrop) {
        termsBackdrop.style.display = 'flex';
        resetModalScroll(termsBackdrop);
    }

    if (isPreLogin) {
        if (termsActions) {
            termsActions.style.display = 'flex'; // Ensure flex is active for two buttons
            termsActions.innerHTML = `
                <button class="link-like" id="cancelTermsBtn">Vazgeç</button>
                <button class="vault-btn" id="acceptTermsBtn">Kabul Ediyorum</button>`;

            const cancelBtn = document.getElementById('cancelTermsBtn');
            if (cancelBtn) {
                cancelBtn.onclick = () => {
                    if (termsBackdrop) termsBackdrop.style.display = 'none';
                    if (termsModalCloseCallback) {
                        termsModalCloseCallback();
                        termsModalCloseCallback = null;
                    }
                };
            }

            const acceptBtn = document.getElementById('acceptTermsBtn');
            if (acceptBtn) {
                acceptBtn.onclick = () => {
                    localStorage.setItem(TERMS_KEY, 'true');
                    if (termsBackdrop) termsBackdrop.style.display = 'none';
                    if (termsModalCloseCallback) {
                        termsModalCloseCallback();
                        termsModalCloseCallback = null;
                    }
                    openVaultAccessMode();
                };
            }
        }
    } else {
        if (termsActions) {
            termsActions.style.display = 'block'; // Override flex for single button
            termsActions.innerHTML = `<button class="vault-btn" id="termsOK" style="width: 100%; text-align: center;">Anladım</button>`;

            const termsOK = document.getElementById('termsOK');
            if (termsOK) {
                termsOK.onclick = () => {
                    if (termsBackdrop) termsBackdrop.style.display = 'none';
                    if (termsModalCloseCallback) {
                        termsModalCloseCallback();
                        termsModalCloseCallback = null;
                    }
                };
            }
        }
    }
}

export function showSecurityModal(onCloseCallback = null) {
    securityModalCloseCallback = onCloseCallback;
    if (securityBackdrop) {
        securityBackdrop.style.display = 'flex';
        resetModalScroll(securityBackdrop);
    }
}

export function showAboutModal(onCloseCallback = null) {
    aboutModalCloseCallback = onCloseCallback;
    const versionEl = document.querySelector('.about-version');
    if (versionEl) {
        const version = document.body.getAttribute('data-version') || 'v1.0.0';
        versionEl.textContent = version;
    }
    if (aboutBackdrop) {
        aboutBackdrop.style.display = 'flex';
        resetModalScroll(aboutBackdrop);
    }
}

export function showHowToUseModal(onCloseCallback = null) {
    howToUseModalCloseCallback = onCloseCallback;
    if (howToUseBackdrop) {
        howToUseBackdrop.style.display = 'flex';
        resetModalScroll(howToUseBackdrop);
    }
}

export function setupInfoHandlers() {
    const infoModalBackdrop = document.getElementById('infoModalBackdrop');
    const infoModalClose = document.getElementById('infoModalClose');

    // Bilgi butonu - Modal aç
    if (infoBtn) {
        infoBtn.onclick = (e) => {
            e.stopPropagation();
            if (infoModalBackdrop) {
                infoModalBackdrop.style.display = 'flex';
                resetModalScroll(infoModalBackdrop);
            }
        };
    }

    // Modal kapatma
    if (infoModalClose) {
        infoModalClose.onclick = () => {
            if (infoModalBackdrop) infoModalBackdrop.style.display = 'none';
        };
    }

    // Backdrop'a tıklayınca kapat
    if (infoModalBackdrop) {
        infoModalBackdrop.onclick = (e) => {
            if (e.target === infoModalBackdrop) infoModalBackdrop.style.display = 'none';
        };

        // Modal içeriğine tıklandığında event'in backdrop'a gitmesini engelle
        const infoModalElement = infoModalBackdrop.querySelector('.modal');
        if (infoModalElement) {
            infoModalElement.onclick = (e) => {
                e.stopPropagation();
            };
        }
    }

    // Bilgi modal seçenekleri
    const infoSecurity = document.getElementById('infoSecurity');
    if (infoSecurity) {
        infoSecurity.onclick = () => {
            if (infoModalBackdrop) infoModalBackdrop.style.display = 'none';
            showSecurityModal();
        };
    }

    const infoTerms = document.getElementById('infoTerms');
    if (infoTerms) {
        infoTerms.onclick = () => {
            if (infoModalBackdrop) infoModalBackdrop.style.display = 'none';
            showTermsModal(false);
        };
    }

    const termsCloseBtn = document.getElementById('termsCloseBtn');
    if (termsCloseBtn) {
        termsCloseBtn.onclick = () => {
            if (termsBackdrop) termsBackdrop.style.display = 'none';
            if (termsModalCloseCallback) {
                termsModalCloseCallback();
                termsModalCloseCallback = null;
            }
        };
    }

    const infoHowToUse = document.getElementById('infoHowToUse');
    if (infoHowToUse) {
        infoHowToUse.onclick = () => {
            if (infoModalBackdrop) infoModalBackdrop.style.display = 'none';
            showHowToUseModal();
        };
    }

    const infoAbout = document.getElementById('infoAbout');
    if (infoAbout) {
        infoAbout.onclick = () => {
            if (infoModalBackdrop) infoModalBackdrop.style.display = 'none';
            showAboutModal();
        };
    }

    const installAppOption = document.getElementById('infoInstallApp');
    if (installAppOption) {
        // Install logic is handled globally in main.js usually, but here we might need to trigger it
        // For now, we assume the event listener is attached elsewhere or we need to implement it.
        // In original ui.js, it was calling `deferredPrompt.prompt()`.
        // We need access to `deferredPrompt`. It's likely a global variable.
        installAppOption.onclick = () => {
            if (window.deferredPrompt) {
                window.deferredPrompt.prompt();
                window.deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the install prompt');
                    } else {
                        console.log('User dismissed the install prompt');
                    }
                    window.deferredPrompt = null;
                    installAppOption.style.display = 'none';
                });
            }
        };
    }

    // Close handlers for individual modals
    const securityClose = document.getElementById('securityClose');
    if (securityClose) {
        securityClose.onclick = () => {
            if (securityBackdrop) securityBackdrop.style.display = 'none';
            if (securityModalCloseCallback) {
                securityModalCloseCallback();
                securityModalCloseCallback = null;
            }
        };
    }

    const aboutClose = document.getElementById('aboutClose');
    if (aboutClose) {
        aboutClose.onclick = () => {
            if (aboutBackdrop) aboutBackdrop.style.display = 'none';
            if (aboutModalCloseCallback) {
                aboutModalCloseCallback();
                aboutModalCloseCallback = null;
            }
        };
    }

    const howToUseClose = document.getElementById('howToUseClose');
    if (howToUseClose) {
        howToUseClose.onclick = () => {
            if (howToUseBackdrop) howToUseBackdrop.style.display = 'none';
            if (howToUseModalCloseCallback) {
                howToUseModalCloseCallback();
                howToUseModalCloseCallback = null;
            }
        };
    }

    const howToUseOK = document.getElementById('howToUseOK');
    if (howToUseOK) {
        howToUseOK.onclick = () => {
            if (howToUseBackdrop) howToUseBackdrop.style.display = 'none';
            if (howToUseModalCloseCallback) {
                howToUseModalCloseCallback();
                howToUseModalCloseCallback = null;
            }
        };
    }

    // Security Modal OK button
    const securityOK = document.getElementById('securityOK');
    if (securityOK) {
        securityOK.onclick = () => {
            if (securityBackdrop) securityBackdrop.style.display = 'none';
            if (securityModalCloseCallback) {
                securityModalCloseCallback();
                securityModalCloseCallback = null;
            }
        };
    }

    // Check Updates
    const infoCheckUpdate = document.getElementById('infoCheckUpdate');
    if (infoCheckUpdate) {
        infoCheckUpdate.onclick = async () => {
            if (infoModalBackdrop) infoModalBackdrop.style.display = 'none';

            // Service Worker'ı güncelle ve önbelleği temizle
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (const registration of registrations) {
                    await registration.unregister();
                }
            }

            // Cache'i temizle
            if ('caches' in window) {
                const keys = await caches.keys();
                for (const key of keys) {
                    await caches.delete(key);
                }
            }

            // Sayfayı yenile
            window.location.reload();
        };
    }

    // Report Bug
    const infoReportBug = document.getElementById('infoReportBug');
    if (infoReportBug) {
        infoReportBug.onclick = () => {
            if (infoModalBackdrop) infoModalBackdrop.style.display = 'none';

            const appVersion = document.body.getAttribute('data-version') || 'v1.3.99';
            const userAgent = navigator.userAgent;
            const body = `\n\n\n---\nUygulama Sürümü: ${appVersion}\nTarayıcı: ${userAgent}`;
            const subject = encodeURIComponent('Hesapp Hata Bildirimi');
            const bodyEncoded = encodeURIComponent(body);

            window.location.href = `mailto:mail@huseyinacikgoz.com.tr?subject=${subject}&body=${bodyEncoded}`;
        };
    }


}
