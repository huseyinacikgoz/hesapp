import {
    appearanceModalBackdrop, autoLockModalBackdrop, themeModalBackdrop,
    changePasswordBackdrop, honeyPasswordBackdrop, modalBackdrop, modalNote,
    settingsBtn, currentVaultPassword, STORAGE_KEY,
    HONEY_PASSWORD_KEY, HONEY_VAULT_KEY, OLD_HONEY_PASSWORD_KEY, OLD_HONEY_VAULT_KEY,
    TRASH_BIN_ENABLED_KEY, isTrashBinEnabled, setTrashBinEnabled, saveVaultData, resetModalScroll
} from './utils.js';

import { showCustomToast } from '../../toast.js';
import { decryptMessage, encryptMessage, verifyHoneyPassword, createHoneyPasswordHash } from '../crypto.js';
import { resetInactivityTimer } from '../vault.js';
import { showVaultManagementScreen, handleExport, handleImport } from './vault-list.js';
import { showConfirmation, hideModal } from './modal-manager.js';

// --- Appearance Modal ---
export function showAppearanceModal() {
    const showWelcomeKey = 'hesapp_show_welcome_on_startup';

    // Mevcut ayarı oku ve radio butonları ayarla
    // 'false' -> Hesap Makinesi (gizle aktif), 'true' veya null -> Ana Sayfa
    const currentSetting = localStorage.getItem(showWelcomeKey);
    const isCalculator = currentSetting === 'false';

    const radioWelcome = document.querySelector('input[name="startupPage"][value="welcome"]');
    const radioCalculator = document.querySelector('input[name="startupPage"][value="calculator"]');

    if (isCalculator) {
        if (radioCalculator) radioCalculator.checked = true;
    } else {
        if (radioWelcome) radioWelcome.checked = true;
    }

    if (appearanceModalBackdrop) {
        appearanceModalBackdrop.style.display = 'flex';
        resetModalScroll(appearanceModalBackdrop);
    }

    // Auto-save logic
    if (appearanceModalBackdrop) {
        const radios = appearanceModalBackdrop.querySelectorAll('input[name="startupPage"]');
        radios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    const newValue = e.target.value === 'calculator' ? 'false' : 'true';
                    localStorage.setItem(showWelcomeKey, newValue);
                }
            });
        });

        const saveBtn = document.getElementById('appearanceSaveBtn');
        if (saveBtn) saveBtn.style.display = 'none';

        const closeBtn = document.getElementById('appearanceCloseBtn');
        if (closeBtn) closeBtn.onclick = () => appearanceModalBackdrop.style.display = 'none';

        // Backdrop'a tıklayınca modal'ı kapat
        appearanceModalBackdrop.onclick = (e) => {
            if (e.target === appearanceModalBackdrop) {
                appearanceModalBackdrop.style.display = 'none';
            }
        };

        // Modal içeriğine tıklandığında event'in backdrop'a gitmesini engelle
        const appearanceModalElement = appearanceModalBackdrop.querySelector('.modal');
        if (appearanceModalElement) {
            appearanceModalElement.onclick = (e) => {
                e.stopPropagation();
            };
        }
    }
}

// --- Settings Modals (Autolock, Change Password) ---
export function showAutoLockModal() {
    const AUTOLOCK_KEY = 'hesapp_autolock_timeout_v1';
    const DEFAULT_AUTOLOCK_TIMEOUT = 3 * 60 * 1000;
    const getTimeout = () => {
        const saved = localStorage.getItem(AUTOLOCK_KEY);
        return saved === null ? DEFAULT_AUTOLOCK_TIMEOUT : (parseInt(saved, 10) === 0 ? Infinity : parseInt(saved, 10));
    };
    const currentTimeout = getTimeout();
    const durations = [
        { label: '15 Saniye', value: 15000 }, { label: '30 Saniye', value: 30000 },
        { label: '1 Dakika', value: 60000 }, { label: '3 Dakika', value: 180000 },
        { label: '5 Dakika', value: 300000 }, { label: 'Asla', value: 0 }
    ];

    const optionsHtml = durations.map(d => `
        <label class="radio-label">
            <input type="radio" name="autolock" value="${d.value}" ${((d.value === 0 && currentTimeout === Infinity) || d.value === currentTimeout) ? 'checked' : ''}>
            <span>${d.label}</span>
        </label>`).join('');

    const warningHtml = `
        <div id="autoLockWarning" style="display: ${currentTimeout === Infinity ? 'block' : 'none'}; margin-top: 15px; padding: 10px; background: rgba(255, 59, 48, 0.1); border: 1px solid var(--error); border-radius: 8px; color: var(--error); font-size: 13px; line-height: 1.4;">
            <div style="display:flex; align-items:center; gap:6px; font-weight:600; margin-bottom:4px;">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:16px; height:16px;">
                    <path fill-rule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clip-rule="evenodd" />
                </svg>
                Güvenlik Uyarısı
            </div>
            "Asla" seçeneği önerilmez. Cihazınızı açık unuttuğunuzda verileriniz savunmasız kalabilir.
        </div>
    `;

    const optionsContainer = document.getElementById('autoLockOptions');
    if (optionsContainer) optionsContainer.innerHTML = optionsHtml + warningHtml;

    // Add change listeners
    document.querySelectorAll('input[name="autolock"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const warning = document.getElementById('autoLockWarning');
            if (warning) {
                if (parseInt(e.target.value) === 0) {
                    warning.style.display = 'block';
                } else {
                    warning.style.display = 'none';
                }
            }
        });
    });

    if (autoLockModalBackdrop) {
        autoLockModalBackdrop.style.display = 'flex';
        resetModalScroll(autoLockModalBackdrop);
    }

    const saveBtn = document.getElementById('autoLockSaveBtn');
    if (saveBtn) {
        saveBtn.onclick = () => {
            const selected = document.querySelector('input[name="autolock"]:checked');
            if (selected) {
                const selectedValue = selected.value;
                localStorage.setItem(AUTOLOCK_KEY, selectedValue);
                if (autoLockModalBackdrop) autoLockModalBackdrop.style.display = 'none';
                showCustomToast('Otomatik kilitleme süresi güncellendi.');
                resetInactivityTimer();
            }
        };
    }

    const closeBtn = document.getElementById('autoLockCloseBtn');
    if (closeBtn) closeBtn.onclick = () => { if (autoLockModalBackdrop) autoLockModalBackdrop.style.display = 'none'; };

    // Backdrop'a tıklayınca modal'ı kapat
    if (autoLockModalBackdrop) {
        autoLockModalBackdrop.onclick = (e) => {
            if (e.target === autoLockModalBackdrop) {
                autoLockModalBackdrop.style.display = 'none';
            }
        };

        // Modal içeriğine tıklandığında event'in backdrop'a gitmesini engelle
        const autoLockModalElement = autoLockModalBackdrop.querySelector('.modal');
        if (autoLockModalElement) {
            autoLockModalElement.onclick = (e) => {
                e.stopPropagation();
            };
        }
    }
}

export function showThemeModal() {
    const themeKey = 'hesapp_theme_v1';
    const savedTheme = localStorage.getItem(themeKey);
    const currentTheme = savedTheme || 'system';
    const themes = [
        {
            label: 'Açık Tema',
            value: 'light',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" /></svg>'
        },
        {
            label: 'Koyu Tema',
            value: 'dark',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" /></svg>'
        },
        {
            label: 'Sistem Tema',
            value: 'system',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>'
        }
    ];

    const themeOptions = document.getElementById('themeOptions');
    if (themeOptions) {
        themeOptions.innerHTML = themes.map(t => `
            <label class="radio-label">
                <div class="theme-option-content">
                    <div class="theme-option-icon">${t.icon}</div>
                    <span>${t.label}</span>
                </div>
                <input type="radio" name="theme" value="${t.value}" ${t.value === currentTheme ? 'checked' : ''}>
            </label>`).join('');
    }

    if (themeModalBackdrop) {
        themeModalBackdrop.style.display = 'flex';
        resetModalScroll(themeModalBackdrop);
    }

    const saveBtn = document.getElementById('themeModalSaveBtn');
    if (saveBtn) {
        saveBtn.onclick = () => {
            const selected = document.querySelector('input[name="theme"]:checked');
            if (selected) {
                const selectedTheme = selected.value;
                const docElement = document.documentElement;

                if (selectedTheme === 'system') {
                    localStorage.removeItem(themeKey);
                    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                    if (prefersDark) {
                        docElement.setAttribute('data-theme', 'dark');
                        docElement.classList.add('dark');
                    } else {
                        docElement.removeAttribute('data-theme');
                        docElement.classList.remove('dark');
                    }
                } else {
                    localStorage.setItem(themeKey, selectedTheme);
                    if (selectedTheme === 'dark') {
                        docElement.setAttribute('data-theme', 'dark');
                        docElement.classList.add('dark');
                    } else {
                        docElement.removeAttribute('data-theme');
                        docElement.classList.remove('dark');
                    }
                }

                if (themeModalBackdrop) themeModalBackdrop.style.display = 'none';
                showCustomToast('Tema ayarı güncellendi.');

                if (typeof gtag === 'function') {
                    gtag('event', 'theme_changed', { 'theme': selectedTheme });
                }
            }
        };
    }

    const closeBtn = document.getElementById('themeModalClose');
    if (closeBtn) closeBtn.onclick = () => { if (themeModalBackdrop) themeModalBackdrop.style.display = 'none'; };

    // Backdrop'a tıklayınca modal'ı kapat
    if (themeModalBackdrop) {
        themeModalBackdrop.onclick = (e) => {
            if (e.target === themeModalBackdrop) {
                themeModalBackdrop.style.display = 'none';
            }
        };

        // Modal içeriğine tıklandığında event'in backdrop'a gitmesini engelle
        const themeModalElement = themeModalBackdrop.querySelector('.modal');
        if (themeModalElement) {
            themeModalElement.onclick = (e) => {
                e.stopPropagation();
            };
        }
    }
}

export function showChangePasswordModal(currentPassword) {
    document.getElementById('currentPass').value = '';
    document.getElementById('newPass1').value = '';
    document.getElementById('newPass2').value = '';
    const noteEl = document.getElementById('changePassNote');
    noteEl.textContent = '';
    noteEl.classList.remove('error');
    if (changePasswordBackdrop) {
        changePasswordBackdrop.style.display = 'flex';
        resetModalScroll(changePasswordBackdrop);
    }

    const saveBtn = document.getElementById('changePassSaveBtn');
    if (saveBtn) {
        saveBtn.onclick = async () => {
            const currentPass = document.getElementById('currentPass').value;
            const newPass1 = document.getElementById('newPass1').value;
            const newPass2 = document.getElementById('newPass2').value;

            if (currentPass !== currentPassword) {
                noteEl.textContent = 'Mevcut parola hatalı.';
                noteEl.classList.add('error');
                return;
            }
            if (newPass1.length < 8) {
                noteEl.textContent = 'Yeni parola en az 8 karakter olmalıdır.';
                noteEl.classList.add('error');
                return;
            }
            if (newPass1 !== newPass2) {
                noteEl.textContent = 'Yeni parolalar eşleşmiyor.';
                noteEl.classList.add('error');
                return;
            }

            try {
                const plainJson = await decryptMessage(currentPass, JSON.parse(localStorage.getItem(STORAGE_KEY)));
                const newEncryptedPayload = await encryptMessage(newPass1, plainJson);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(newEncryptedPayload));
                if (typeof gtag === 'function') gtag('event', 'feature_used', { 'feature_name': 'change_password' });
                if (changePasswordBackdrop) changePasswordBackdrop.style.display = 'none';
                showCustomToast('Parola başarıyla değiştirildi!');
                hideModal();
            } catch (e) {
                noteEl.textContent = 'Bir hata oluştu. Mevcut parola hatalı olabilir.';
                noteEl.classList.add('error');
            }
        };
    }

    const closeBtn = document.getElementById('changePassCloseBtn');
    if (closeBtn) closeBtn.onclick = () => { if (changePasswordBackdrop) changePasswordBackdrop.style.display = 'none'; };

    // Backdrop'a tıklayınca modal'ı kapat
    if (changePasswordBackdrop) {
        changePasswordBackdrop.onclick = (e) => {
            if (e.target === changePasswordBackdrop) {
                changePasswordBackdrop.style.display = 'none';
            }
        };

        // Modal içeriğine tıklandığında event'in backdrop'a gitmesini engelle
        const changePassModalElement = changePasswordBackdrop.querySelector('.modal');
        if (changePassModalElement) {
            changePassModalElement.onclick = (e) => {
                e.stopPropagation();
            };
        }
    }
}

export async function showHoneyPasswordModal() {
    const honeyPass1 = document.getElementById('honeyPass1');
    const honeyPass2 = document.getElementById('honeyPass2');
    const honeyPassNote = document.getElementById('honeyPassNote');
    const honeyPassStatus = document.getElementById('honeyPassStatus');

    // Güvenlik: Sadece gerçek kasa açıkken sahte parola durumunu göster
    // Gerçek kasa açık mı kontrol et (currentVaultPassword ile STORAGE_KEY decrypt edilebiliyorsa)
    let isRealVaultOpen = false;
    if (currentVaultPassword) {
        try {
            const storedData = localStorage.getItem(STORAGE_KEY);
            if (storedData) {
                const enc = JSON.parse(storedData);
                await decryptMessage(currentVaultPassword, enc);
                isRealVaultOpen = true; // Gerçek kasa açık
            }
        } catch (e) {
            // Gerçek kasa açık değil (sahte parola ile giriş yapılmış olabilir)
            isRealVaultOpen = false;
        }
    }

    // Mevcut sahte parolayı kontrol et (hash olarak saklanıyor)
    // Önce yeni anahtarı kontrol et, yoksa eski anahtarı migrate et
    let existingHoneyPasswordData = localStorage.getItem(HONEY_PASSWORD_KEY);
    if (!existingHoneyPasswordData) {
        // Eski anahtardan migrate et
        const oldData = localStorage.getItem(OLD_HONEY_PASSWORD_KEY);
        const oldVault = localStorage.getItem(OLD_HONEY_VAULT_KEY);
        if (oldData) {
            try {
                const parsed = JSON.parse(oldData);
                if (parsed.salt && parsed.hash) {
                    // Eski format hash ise yeni anahtara taşı
                    localStorage.setItem(HONEY_PASSWORD_KEY, oldData);
                    if (oldVault) localStorage.setItem(HONEY_VAULT_KEY, oldVault);
                    localStorage.removeItem(OLD_HONEY_PASSWORD_KEY);
                    localStorage.removeItem(OLD_HONEY_VAULT_KEY);
                    existingHoneyPasswordData = oldData;
                } else {
                    // Eski format açık metin ise sil
                    localStorage.removeItem(OLD_HONEY_PASSWORD_KEY);
                    localStorage.removeItem(OLD_HONEY_VAULT_KEY);
                }
            } catch (e) {
                // Eski format açık metin string ise sil
                localStorage.removeItem(OLD_HONEY_PASSWORD_KEY);
                localStorage.removeItem(OLD_HONEY_VAULT_KEY);
            }
        }
    }

    // Güvenlik: Sadece gerçek kasa açıkken sahte parola durumunu göster
    if (isRealVaultOpen && existingHoneyPasswordData) {
        try {
            const parsed = JSON.parse(existingHoneyPasswordData);
            if (parsed.salt && parsed.hash) {
                // Yeni format (hash) - sadece gerçek kasa açıkken göster
                honeyPassStatus.textContent = '✓ Sahte parola aktif';
                honeyPassStatus.style.background = 'var(--key-bg)';
                honeyPassStatus.style.color = 'var(--input-text)';
                document.getElementById('honeyPassDeleteBtn').style.display = 'block';
            } else {
                // Geçersiz format - sil
                localStorage.removeItem(HONEY_PASSWORD_KEY);
                localStorage.removeItem(HONEY_VAULT_KEY);
                honeyPassStatus.textContent = 'Sahte parola belirlenmemiş';
                honeyPassStatus.style.background = 'var(--key-bg)';
                honeyPassStatus.style.color = 'var(--muted)';
                document.getElementById('honeyPassDeleteBtn').style.display = 'none';
            }
        } catch (e) {
            // Geçersiz format - sil
            localStorage.removeItem(HONEY_PASSWORD_KEY);
            localStorage.removeItem(HONEY_VAULT_KEY);
            honeyPassStatus.textContent = 'Sahte parola belirlenmemiş';
            honeyPassStatus.style.background = 'var(--key-bg)';
            honeyPassStatus.style.color = 'var(--muted)';
            document.getElementById('honeyPassDeleteBtn').style.display = 'none';
        }
    } else {
        // Gerçek kasa açık değilse veya sahte parola yoksa durum gösterme
        honeyPassStatus.textContent = '';
        honeyPassStatus.style.background = 'transparent';
        honeyPassStatus.style.color = 'transparent';
        document.getElementById('honeyPassDeleteBtn').style.display = isRealVaultOpen && existingHoneyPasswordData ? 'block' : 'none';
    }

    honeyPass1.value = '';
    honeyPass2.value = '';
    honeyPassNote.textContent = '';
    honeyPassNote.classList.remove('error');
    if (honeyPasswordBackdrop) {
        honeyPasswordBackdrop.style.display = 'flex';
        resetModalScroll(honeyPasswordBackdrop);
    }

    const saveBtn = document.getElementById('honeyPassSaveBtn');
    if (saveBtn) {
        saveBtn.onclick = async () => {
            const p1 = honeyPass1.value || '';
            const p2 = honeyPass2.value || '';

            if (p1.length < 8) {
                honeyPassNote.textContent = 'Sahte parola en az 8 karakter olmalıdır.';
                honeyPassNote.classList.add('error');
                return;
            }
            if (p1 !== p2) {
                honeyPassNote.textContent = 'Parolalar eşleşmiyor.';
                honeyPassNote.classList.add('error');
                return;
            }

            // Gerçek parola ile aynı olamaz kontrolü
            if (currentVaultPassword && p1 === currentVaultPassword) {
                honeyPassNote.textContent = 'Sahte parola, gerçek parola ile aynı olamaz.';
                honeyPassNote.classList.add('error');
                return;
            }

            try {
                // Sahte parolayı hash'le ve sakla (açık metin olarak değil)
                const honeyPasswordHash = await createHoneyPasswordHash(p1);
                localStorage.setItem(HONEY_PASSWORD_KEY, JSON.stringify(honeyPasswordHash));

                // Sahte kasa oluştur (boş)
                const emptyMessages = [];
                const honeyVaultEnc = await encryptMessage(p1, JSON.stringify(emptyMessages));
                localStorage.setItem(HONEY_VAULT_KEY, JSON.stringify(honeyVaultEnc));

                if (typeof gtag === 'function') {
                    gtag('event', 'feature_used', { 'feature_name': 'honey_password_set' });
                }
                if (honeyPasswordBackdrop) honeyPasswordBackdrop.style.display = 'none';
                // Güvenlik: Sahte parola ayarlandığında mesaj gösterme
                // showCustomToast('Sahte parola başarıyla ayarlandı!');
            } catch (e) {
                honeyPassNote.textContent = 'Bir hata oluştu. Lütfen tekrar deneyin.';
                honeyPassNote.classList.add('error');
            }
        };
    }

    const deleteBtn = document.getElementById('honeyPassDeleteBtn');
    if (deleteBtn) {
        deleteBtn.onclick = async () => {
            const confirmed = await showConfirmation(`
                <div>
                    <strong>Sahte parolayı silmek istediğinizden emin misiniz?</strong>
                </div>
            `);
            if (confirmed) {
                localStorage.removeItem(HONEY_PASSWORD_KEY);
                localStorage.removeItem(HONEY_VAULT_KEY);
                // Eski anahtarları da temizle
                localStorage.removeItem(OLD_HONEY_PASSWORD_KEY);
                localStorage.removeItem(OLD_HONEY_VAULT_KEY);
                if (typeof gtag === 'function') {
                    gtag('event', 'feature_used', { 'feature_name': 'honey_password_deleted' });
                }
                if (honeyPasswordBackdrop) honeyPasswordBackdrop.style.display = 'none';
                // Güvenlik: Sahte parola silindiğinde mesaj gösterme
                // showCustomToast('Sahte parola silindi!');
            }
        };
    }

    const closeBtn = document.getElementById('honeyPassCloseBtn');
    if (closeBtn) closeBtn.onclick = () => {
        if (honeyPasswordBackdrop) honeyPasswordBackdrop.style.display = 'none';
    };

    // Backdrop'a tıklayınca modal'ı kapat
    if (honeyPasswordBackdrop) {
        honeyPasswordBackdrop.onclick = (e) => {
            if (e.target === honeyPasswordBackdrop) {
                honeyPasswordBackdrop.style.display = 'none';
            }
        };

        // Modal içeriğine tıklandığında event'in backdrop'a gitmesini engelle
        const honeyPassModalElement = honeyPasswordBackdrop.querySelector('.modal');
        if (honeyPassModalElement) {
            honeyPassModalElement.onclick = (e) => {
                e.stopPropagation();
            };
        }
    }
}

export function setupSettingsHandlers() {
    const settingsModalBackdrop = document.getElementById('settingsModalBackdrop');
    const settingsModalClose = document.getElementById('settingsModalClose');

    // Ayarlar butonu - Modal aç
    if (settingsBtn) {
        settingsBtn.onclick = async (e) => {
            e.stopPropagation();
            // Güvenlik: Sadece gerçek kasa açıkken sahte parola seçeneğini göster
            let isRealVaultOpen = false;
            if (currentVaultPassword) {
                try {
                    const storedData = localStorage.getItem(STORAGE_KEY);
                    if (storedData) {
                        const enc = JSON.parse(storedData);
                        await decryptMessage(currentVaultPassword, enc);
                        isRealVaultOpen = true; // Gerçek kasa açık
                    }
                } catch (e) {
                    // Gerçek kasa açık değil (sahte parola ile giriş yapılmış olabilir)
                    isRealVaultOpen = false;
                }
            }
            // Sahte parola seçeneğini göster/gizle
            const honeyPasswordOption = document.getElementById('settingsHoneyPassword');
            if (honeyPasswordOption) {
                honeyPasswordOption.style.display = isRealVaultOpen ? 'flex' : 'none';
            }
            if (settingsModalBackdrop) {
                settingsModalBackdrop.style.display = 'flex';
                resetModalScroll(settingsModalBackdrop);
            }
        };
    }

    // Modal kapatma
    if (settingsModalClose) {
        settingsModalClose.onclick = () => {
            if (settingsModalBackdrop) settingsModalBackdrop.style.display = 'none';
        };
    }

    // Backdrop'a tıklayınca kapat
    if (settingsModalBackdrop) {
        settingsModalBackdrop.onclick = (e) => {
            if (e.target === settingsModalBackdrop) settingsModalBackdrop.style.display = 'none';
        };

        // Modal içeriğine tıklandığında event'in backdrop'a gitmesini engelle
        const settingsModalElement = settingsModalBackdrop.querySelector('.modal');
        if (settingsModalElement) {
            settingsModalElement.onclick = (e) => {
                e.stopPropagation();
            };
        }
    }

    // Ayarlar modal seçenekleri
    const settingsChangePassword = document.getElementById('settingsChangePassword');
    if (settingsChangePassword) {
        settingsChangePassword.onclick = () => {
            if (settingsModalBackdrop) settingsModalBackdrop.style.display = 'none';
            if (currentVaultPassword) showChangePasswordModal(currentVaultPassword);
            else showCustomToast('Kasa açık değil. Lütfen önce kasayı açın.');
        };
    }

    const settingsTheme = document.getElementById('settingsTheme');
    if (settingsTheme) {
        settingsTheme.onclick = () => {
            if (settingsModalBackdrop) settingsModalBackdrop.style.display = 'none';
            showThemeModal();
        };
    }

    const settingsAppearance = document.getElementById('settingsAppearance');
    if (settingsAppearance) {
        settingsAppearance.onclick = () => {
            if (settingsModalBackdrop) settingsModalBackdrop.style.display = 'none';
            showAppearanceModal();
        };
    }

    const settingsAutoLock = document.getElementById('settingsAutoLock');
    if (settingsAutoLock) {
        settingsAutoLock.onclick = () => {
            if (settingsModalBackdrop) settingsModalBackdrop.style.display = 'none';
            showAutoLockModal();
        };
    }

    const settingsHoneyPassword = document.getElementById('settingsHoneyPassword');
    if (settingsHoneyPassword) {
        settingsHoneyPassword.onclick = async () => {
            if (settingsModalBackdrop) settingsModalBackdrop.style.display = 'none';
            await showHoneyPasswordModal();
        };
    }

    // Çöp Kutusu Ayarları
    const trashBinModalBackdrop = document.getElementById('trashBinModalBackdrop');
    const trashBinToggle = document.getElementById('trashBinToggle');
    const trashBinCloseBtn = document.getElementById('trashBinCloseBtn');
    const settingsTrashBin = document.getElementById('settingsTrashBin');

    if (settingsTrashBin) {
        settingsTrashBin.onclick = () => {
            if (settingsModalBackdrop) settingsModalBackdrop.style.display = 'none';
            // Mevcut ayarı yükle
            if (trashBinToggle) trashBinToggle.checked = isTrashBinEnabled();
            if (trashBinModalBackdrop) {
                trashBinModalBackdrop.style.display = 'flex';
                resetModalScroll(trashBinModalBackdrop);
            }
        };
    }

    if (trashBinCloseBtn) {
        trashBinCloseBtn.onclick = () => {
            if (trashBinModalBackdrop) trashBinModalBackdrop.style.display = 'none';
        };
    }

    // Çöp kutusu toggle değişikliği
    if (trashBinToggle) {
        trashBinToggle.addEventListener('change', async (e) => {
            const wasEnabled = isTrashBinEnabled();
            const willBeEnabled = e.target.checked;

            // Eğer çöp kutusu kapatılıyorsa ve kasada silinmiş notlar varsa uyar
            if (wasEnabled && !willBeEnabled && currentVaultPassword) {
                try {
                    const storedData = localStorage.getItem(STORAGE_KEY);
                    if (storedData) {
                        const enc = JSON.parse(storedData);
                        const plainJson = await decryptMessage(currentVaultPassword, enc);
                        const messages = JSON.parse(plainJson);
                        const deletedCount = messages.filter(msg => msg.isDeleted).length;

                        if (deletedCount > 0) {
                            const confirmed = await showConfirmation(
                                `<div>Çöp kutusunu kapatmak istediğinizden emin misiniz?</div><div style='margin-top:8px;'><small style='color:var(--muted); font-size:14px;'>Çöp kutusundaki <strong>${deletedCount} not</strong> kalıcı olarak silinecek.</small></div>`,
                                "Kapat ve Sil",
                                "İptal"
                            );

                            if (!confirmed) {
                                // İptal edildi - toggle'ı geri aç
                                e.target.checked = true;
                                return;
                            }

                            // Onaylandı - silinmiş notları sil
                            const filteredMessages = messages.filter(msg => !msg.isDeleted);
                            await saveVaultData(currentVaultPassword, filteredMessages);
                            setTrashBinEnabled(false);
                            if (trashBinModalBackdrop) trashBinModalBackdrop.style.display = 'none';
                            showCustomToast('Çöp kutusu kapatıldı ve silinmiş notlar temizlendi');
                            showVaultManagementScreen(currentVaultPassword, filteredMessages);
                            return;
                        }
                    }
                } catch (e) {
                    // Hata durumunda toggle'ı geri al
                    e.target.checked = true;
                    return;
                }
            }

            // Normal kaydetme (açma veya notlar yokken kapatma)
            setTrashBinEnabled(willBeEnabled);
            if (trashBinModalBackdrop) trashBinModalBackdrop.style.display = 'none';

            if (willBeEnabled) {
                showCustomToast('Çöp kutusu aktif edildi.');
            } else {
                showCustomToast('Çöp kutusu kapatıldı.');
            }

            // Ayarlar değiştiğinde kasa ekranını yenile (çıkış yapma)
            if (currentVaultPassword) {
                try {
                    const storedData = localStorage.getItem(STORAGE_KEY);
                    if (storedData) {
                        const enc = JSON.parse(storedData);
                        const plainJson = await decryptMessage(currentVaultPassword, enc);
                        const messages = JSON.parse(plainJson);
                        showVaultManagementScreen(currentVaultPassword, messages);
                    }
                } catch (e) {
                    console.error('Vault refresh error:', e);
                }
            }
        });
    }

    const settingsExport = document.getElementById('settingsExport');
    if (settingsExport) {
        settingsExport.onclick = () => {
            if (settingsModalBackdrop) settingsModalBackdrop.style.display = 'none';
            handleExport();
        };
    }

    const settingsImport = document.getElementById('settingsImport');
    if (settingsImport) {
        settingsImport.onclick = () => {
            if (settingsModalBackdrop) settingsModalBackdrop.style.display = 'none';
            handleImport();
        };
    }

    const settingsDeleteVault = document.getElementById('settingsDeleteVault');
    if (settingsDeleteVault) {
        settingsDeleteVault.onclick = async () => {
            if (settingsModalBackdrop) settingsModalBackdrop.style.display = 'none';
            const confirmed = await showConfirmation(`
                <div>
                    <strong>DİKKAT:</strong> Gizli kasayı ve <strong>TÜM MESAJLARI</strong> kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!
                </div>
            `);
            if (confirmed) {
                // Google Analytics event: Kasa silme
                if (typeof gtag === 'function') {
                    gtag('event', 'vault_deleted', {
                        'event_category': 'Kasa',
                        'event_label': 'Kasa Silindi'
                    });
                }
                localStorage.removeItem(STORAGE_KEY);
                // TERMS_KEY silinmeli mi? Orijinal kod siliyor.
                localStorage.removeItem('hesapp_terms_accepted_v1'); // TERMS_KEY
                hideModal();
                if (modalBackdrop) {
                    modalBackdrop.style.display = 'none';
                    delete modalBackdrop.dataset.wasOpen;
                }
                // currentVaultPassword = null; // utils.js'de setter yok mu? Var.
                // Ancak utils.js'den import edilen currentVaultPassword read-only.
                // Bu yüzden utils.js'e setCurrentVaultPassword eklemiştim.
                // Ama burada import etmedim.
                // Import etmeliyim.
                // Şimdilik reload yapalım mı? Hayır, SPA gibi çalışıyor.
                // setCurrentVaultPassword(null); // Bunu import etmem lazım.
                showCustomToast('Kasa başarıyla silindi!');

                // Sayfayı yenilemek en temizi
                setTimeout(() => window.location.reload(), 1500);
            }
        };
    }
}
