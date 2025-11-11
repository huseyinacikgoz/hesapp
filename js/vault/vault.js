import { showModal, hideModal, showVaultManagementScreen, openVaultAccessMode } from './ui.js';

let equalsPressCount = 0;
let inactivityTimer;

const AUTOLOCK_KEY = 'hesapp_autolock_timeout_v1';
const DEFAULT_AUTOLOCK_TIMEOUT = 3 * 60 * 1000; // 3 dakika

function getInactivityTimeout() {
    const savedTimeout = localStorage.getItem(AUTOLOCK_KEY);
    if (savedTimeout === null || isNaN(parseInt(savedTimeout))) {
        return DEFAULT_AUTOLOCK_TIMEOUT;
    }
    const timeoutMs = parseInt(savedTimeout, 10);
    return timeoutMs === 0 ? Infinity : timeoutMs; // 0 "Asla" anlamına gelir
}

function lockVaultDueToInactivity() {
    const modalBackdrop = document.getElementById('modalBackdrop');
    const securityBackdrop = document.getElementById('securityBackdrop');
    if (modalBackdrop.style.display === 'flex' || securityBackdrop.style.display === 'flex') {
        hideModal();
        // Bu fonksiyon artık ui.js'de değil, toast.js'de
        // window.showCustomToast('Kasa, işlem yapılmadığı için kilitlendi.');
        // Doğrusu, toast modülünü import edip kullanmak, ama bu dosya ui'dan haberdar olmamalı.
        // Şimdilik bu bildirimi atlayalım veya daha iyi bir yol bulalım.
        // En iyisi, hideModal içinde bu kontrolü yapmak.
    }
}

export function resetInactivityTimer() {
    const timeoutDuration = getInactivityTimeout();
    clearTimeout(inactivityTimer);
    if (timeoutDuration !== Infinity) {
        inactivityTimer = setTimeout(lockVaultDueToInactivity, timeoutDuration);
    }
}

export function handleEqualsPress() {
    equalsPressCount++;
    setTimeout(() => { equalsPressCount = 0; }, 1500);
    if (equalsPressCount >= 3) {
        equalsPressCount = 0;
        openVaultAccessMode();
    }
}

export function initVault() {
    // Vault'un ana başlatma mantığı burada olabilir, ancak çoğu şey
    // `handleEqualsPress` tarafından tetikleniyor.
}