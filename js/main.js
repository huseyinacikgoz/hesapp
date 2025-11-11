import { initTheme } from './theme.js';
import { initSplashScreen } from './splash.js';
import { initCalculator } from './calculator/calculator.js';
import { initVaultUI } from './vault/ui.js';
import { initPwa } from './pwa.js';
import { initVault } from './vault/vault.js';
import { initShortcuts } from './shortcuts.js';

/**
 * Uygulamanın ana giriş noktası.
 * DOM yüklendiğinde tüm modülleri başlatır.
 */
document.addEventListener('DOMContentLoaded', () => {
    // UI Modülleri
    initTheme();
    initSplashScreen();

    // Fonksiyonel Modüller
    initCalculator();
    initVault();
    initVaultUI();
    initPwa();
    initShortcuts();
});