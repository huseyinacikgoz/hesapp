import { showCustomToast } from '../../toast.js';
import { encryptMessage, decryptMessage } from '../crypto.js';

// ===== DOM ELEMENT REFERENCES =====
export const modalBackdrop = document.getElementById('modalBackdrop');
export const modalContent = document.getElementById('modalContent');
export const modalOK = document.getElementById('modalOK');
export const modalCancel = document.getElementById('modalCancel');
export const leftActions = document.getElementById('leftActions');
export const modalNote = document.getElementById('modalNote');
export const modalTitle = document.getElementById('modalTitle');
export const vaultCloseBtn = document.getElementById('vaultCloseBtn');
export const vaultBackBtn = document.getElementById('vaultBackBtn');

export const securityBackdrop = document.getElementById('securityBackdrop');
export const securityClose = document.getElementById('securityClose');
export const infoBtn = document.getElementById('infoBtn');
export const settingsBtn = document.getElementById('settingsBtn');
export const infoDropdownContainer = document.getElementById('infoDropdownContainer');
export const settingsDropdownContainer = document.getElementById('settingsDropdownContainer');
export const termsBackdrop = document.getElementById('termsBackdrop');
export const termsActions = document.getElementById('termsActions');
export const aboutBackdrop = document.getElementById('aboutBackdrop');
export const aboutClose = document.getElementById('aboutClose');
export const howToUseBackdrop = document.getElementById('howToUseBackdrop');
export const howToUseClose = document.getElementById('howToUseClose');
export const howToUseOK = document.getElementById('howToUseOK');
export const autoLockModalBackdrop = document.getElementById('autoLockModalBackdrop');
export const changePasswordBackdrop = document.getElementById('changePasswordBackdrop');
export const honeyPasswordBackdrop = document.getElementById('honeyPasswordBackdrop');
export const appearanceModalBackdrop = document.getElementById('appearanceModalBackdrop');
export const themeModalBackdrop = document.getElementById('themeModalBackdrop');
export const confirmBackdrop = document.getElementById('confirmBackdrop');
export const confirmMessage = document.getElementById('confirmMessage');
export const confirmOK = document.getElementById('confirmOK');
export const confirmCancel = document.getElementById('confirmCancel');

// ===== CONSTANTS =====
export const HOW_TO_USE_ON_FIRST_LOGIN_KEY = 'hesapp_show_howto_on_first_login_v1';
export const STORAGE_KEY = 'kasa_encrypted_v1';
export const TERMS_KEY = 'hesapp_terms_accepted_v1';
export const HONEY_PASSWORD_KEY = 'hesapp_aux_key_v1';
export const HONEY_VAULT_KEY = 'hesapp_aux_data_v1';
export const OLD_HONEY_PASSWORD_KEY = 'hesapp_honey_password_v1';
export const OLD_HONEY_VAULT_KEY = 'hesapp_honey_vault_v1';
export const LOGIN_ATTEMPTS_KEY = 'hesapp_login_attempts_v1';
export const TRASH_BIN_ENABLED_KEY = 'hesapp_trash_bin_enabled_v1';

export const EMPTY_STATE_SVG = `<svg class="empty-state-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>`;
export const NO_SEARCH_SVG = `<svg class="empty-state-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>`;

// ===== SHARED STATE =====
export let currentVaultPassword = null;
export let currentFilter = 'all';
export let lockoutInterval = null;
export let backdropClickTimeout = null;
export let confirmationResolver = null;
export let inactivityAbortController = null; // Event listener cleanup için

// State setters
export function setCurrentVaultPassword(password) {
    currentVaultPassword = password;
}

export function setCurrentFilter(filter) {
    currentFilter = filter;
}

export function setLockoutInterval(interval) {
    lockoutInterval = interval;
}

export function setBackdropClickTimeout(timeout) {
    backdropClickTimeout = timeout;
}

export function setConfirmationResolver(resolver) {
    confirmationResolver = resolver;
}

// Inactivity listener cleanup
export function cleanupInactivityListeners() {
    if (inactivityAbortController) {
        inactivityAbortController.abort();
        inactivityAbortController = null;
    }
}

export function createInactivityAbortController() {
    // Önce eski listener'ları temizle
    cleanupInactivityListeners();
    // Yeni controller oluştur
    inactivityAbortController = new AbortController();
    return inactivityAbortController;
}

// ===== UTILITY FUNCTIONS =====

// XSS koruması: HTML escape fonksiyonu
export function escapeHtml(text) {
    if (text == null) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

// Tarih formatlama
export function formatVaultDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}.${month}.${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

// Kasa varlığı kontrolü
export function hasVault() {
    return Boolean(localStorage.getItem(STORAGE_KEY));
}

// Çöp kutusu helper fonksiyonları
export function isTrashBinEnabled() {
    const setting = localStorage.getItem(TRASH_BIN_ENABLED_KEY);
    return setting === null ? true : setting === 'true';
}

export function setTrashBinEnabled(enabled) {
    localStorage.setItem(TRASH_BIN_ENABLED_KEY, enabled ? 'true' : 'false');
}

// Veri kaydetme
export async function saveVaultData(password, messages) {
    try {
        const { verifyHoneyPassword } = await import('../crypto.js');
        let isHoneyPassword = false;
        let honeyPasswordData = localStorage.getItem(HONEY_PASSWORD_KEY);

        if (honeyPasswordData) {
            try {
                const honeyData = JSON.parse(honeyPasswordData);
                if (honeyData.salt && honeyData.hash) {
                    isHoneyPassword = await verifyHoneyPassword(password, honeyData);
                }
            } catch (e) { }
        }

        if (isHoneyPassword) {
            const enc = await encryptMessage(password, JSON.stringify(messages));
            localStorage.setItem(HONEY_VAULT_KEY, JSON.stringify(enc));
        } else {
            const enc = await encryptMessage(password, JSON.stringify(messages));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(enc));
        }
        return true;
    } catch (e) {
        console.error('Save error:', e);
        return false;
    }
}

// Modal scroll reset helper
export function resetModalScroll(backdrop) {
    if (!backdrop) return;
    const content = backdrop.querySelector('.modal-scroll-content') || backdrop.querySelector('#modalContent');
    if (content) {
        content.scrollTop = 0;
    }
}
