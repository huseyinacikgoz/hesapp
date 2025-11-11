/**
 * Klavye kısayolları modülü
 * Uygulama genelinde klavye kısayollarını yönetir
 */

let shortcutsEnabled = true;

/**
 * Klavye kısayollarını başlatır
 */
export function initShortcuts() {
    document.addEventListener('keydown', handleGlobalShortcuts);
}

/**
 * Global klavye kısayollarını yönetir
 */
function handleGlobalShortcuts(e) {
    // Input veya textarea odaklıysa, bazı kısayolları devre dışı bırak
    const activeElement = document.activeElement;
    const isInputFocused = activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.isContentEditable
    );

    // Escape: Açık modalları kapat
    if (e.key === 'Escape' && !isInputFocused) {
        const openModals = document.querySelectorAll('.modal-backdrop[style*="flex"]');
        if (openModals.length > 0) {
            openModals.forEach(modal => {
                modal.style.display = 'none';
            });
            e.preventDefault();
            return;
        }
    }

    // Ctrl/Cmd + K: Kasa aç (hesap makinesi ekranındayken)
    if ((e.ctrlKey || e.metaKey) && e.key === 'k' && !isInputFocused) {
        const device = document.querySelector('.device');
        if (device && !device.classList.contains('hidden')) {
            // Kasa açma işlemi için = tuşuna 3 kez basma simülasyonu
            // Bu, vault.js'deki handleEqualsPress fonksiyonunu tetikler
            e.preventDefault();
            // Bu işlev vault.js'de yönetiliyor, burada sadece kısayol tanımlıyoruz
            return;
        }
    }

    // Ctrl/Cmd + /: Kısayolları göster
    if ((e.ctrlKey || e.metaKey) && e.key === '/' && !isInputFocused) {
        e.preventDefault();
        showShortcutsHelp();
        return;
    }
}

/**
 * Kısayollar yardım modalını gösterir
 */
function showShortcutsHelp() {
    const helpModal = document.createElement('div');
    helpModal.className = 'modal-backdrop';
    helpModal.style.display = 'flex';
    helpModal.innerHTML = `
        <div class="modal" style="max-width: 500px;">
            <div class="modal-header" style="justify-content: space-between;">
                <h3 style="margin: 0;">Klavye Kısayolları</h3>
                <button class="security-close-btn" onclick="this.closest('.modal-backdrop').style.display='none'">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Z" />
                        <path fill="#fff" d="M10.28 9.22a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" />
                    </svg>
                </button>
            </div>
            <div class="modal-scroll-content">
                <div style="display: flex; flex-direction: column; gap: 16px;">
                    <div>
                        <h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: var(--input-text);">Hesap Makinesi</h4>
                        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 14px;">
                            <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--modal-border);">
                                <span style="color: var(--muted);">Sayılar ve Operatörler</span>
                                <kbd style="background: var(--key-bg); padding: 4px 8px; border-radius: 4px; font-size: 12px; color: var(--input-text);">0-9, +, -, *, /</kbd>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--modal-border);">
                                <span style="color: var(--muted);">Hesapla</span>
                                <kbd style="background: var(--key-bg); padding: 4px 8px; border-radius: 4px; font-size: 12px; color: var(--input-text);">Enter veya =</kbd>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--modal-border);">
                                <span style="color: var(--muted);">Geri Al</span>
                                <kbd style="background: var(--key-bg); padding: 4px 8px; border-radius: 4px; font-size: 12px; color: var(--input-text);">Backspace</kbd>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 6px 0;">
                                <span style="color: var(--muted);">Temizle</span>
                                <kbd style="background: var(--key-bg); padding: 4px 8px; border-radius: 4px; font-size: 12px; color: var(--input-text);">Escape</kbd>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: var(--input-text);">Kasa</h4>
                        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 14px;">
                            <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--modal-border);">
                                <span style="color: var(--muted);">Yeni Not</span>
                                <kbd style="background: var(--key-bg); padding: 4px 8px; border-radius: 4px; font-size: 12px; color: var(--input-text);">Ctrl/Cmd + N</kbd>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--modal-border);">
                                <span style="color: var(--muted);">Arama</span>
                                <kbd style="background: var(--key-bg); padding: 4px 8px; border-radius: 4px; font-size: 12px; color: var(--input-text);">Ctrl/Cmd + F</kbd>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--modal-border);">
                                <span style="color: var(--muted);">Kaydet (Düzenleme)</span>
                                <kbd style="background: var(--key-bg); padding: 4px 8px; border-radius: 4px; font-size: 12px; color: var(--input-text);">Ctrl/Cmd + S</kbd>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 6px 0;">
                                <span style="color: var(--muted);">Modal Kapat</span>
                                <kbd style="background: var(--key-bg); padding: 4px 8px; border-radius: 4px; font-size: 12px; color: var(--input-text);">Escape</kbd>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: var(--input-text);">Genel</h4>
                        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 14px;">
                            <div style="display: flex; justify-content: space-between; padding: 6px 0;">
                                <span style="color: var(--muted);">Kısayolları Göster</span>
                                <kbd style="background: var(--key-bg); padding: 4px 8px; border-radius: 4px; font-size: 12px; color: var(--input-text);">Ctrl/Cmd + /</kbd>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(helpModal);
    
    // Modal dışına tıklanınca kapat
    helpModal.addEventListener('click', (e) => {
        if (e.target === helpModal) {
            helpModal.remove();
        }
    });
}

/**
 * Kısayolları devre dışı bırakır (geçici olarak)
 */
export function disableShortcuts() {
    shortcutsEnabled = false;
}

/**
 * Kısayolları tekrar etkinleştirir
 */
export function enableShortcuts() {
    shortcutsEnabled = true;
}

