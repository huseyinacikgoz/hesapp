import {
    STORAGE_KEY, LOGIN_ATTEMPTS_KEY, TERMS_KEY, HOW_TO_USE_ON_FIRST_LOGIN_KEY,
    HONEY_PASSWORD_KEY, HONEY_VAULT_KEY, OLD_HONEY_PASSWORD_KEY, OLD_HONEY_VAULT_KEY,
    TRASH_BIN_ENABLED_KEY,
    modalNote, modalTitle, modalOK, modalBackdrop, modalContent, leftActions,
    escapeHtml, hasVault, lockoutInterval, setLockoutInterval,
    currentVaultPassword, setCurrentVaultPassword, vaultCloseBtn,
    createInactivityAbortController, cleanupInactivityListeners
} from './utils.js';

import { showModal, hideModal, showConfirmation } from './modal-manager.js';
import { encryptMessage, decryptMessage, verifyHoneyPassword } from '../crypto.js';
import { resetInactivityTimer } from '../vault.js';
import { showVaultManagementScreen, handleImport } from './vault-list.js';
import { showHowToUseModal, showTermsModal, showSecurityModal } from './info-modals.js';

/**
 * --- Brute-Force Protection ---
 * 
 * Bu koruma, yerel cihazda çalışan bir offline uygulama için tasarlanmıştır.
 * Veriler localStorage'da saklandığından, sunucu tarafında koruma mümkün değildir.
 * 
 * ÇALIŞMA MANTIĞı:
 * - 3 başarısız deneme: 1 dakika bekleme
 * - 6 başarısız deneme: 3 dakika bekleme
 * - 9+ başarısız deneme: 5 dakika bekleme
 * 
 * NOT: Bu koruma client-side olduğundan, localStorage temizlenirse sıfırlanır.
 * Ancak bu, offline bir uygulama için kabul edilebilir bir trade-off'tur.
 * Gerçek güvenlik, AES-256-GCM şifreleme ve PBKDF2 600,000 iteration ile sağlanır.
 * 
 * Bu yaklaşımın avantajları:
 * 1. Casual saldırganları caydırır
 * 2. Otomatik deneme araçlarını yavaşlatır
 * 3. Kullanıcıya yanlış parola hatırlatması sağlar
 */

export function getLoginAttempts() {
    try {
        const data = JSON.parse(localStorage.getItem(LOGIN_ATTEMPTS_KEY));
        if (data && typeof data.count === 'number' && typeof data.lockoutUntil === 'number') {
            return data;
        }
    } catch (e) { /* ignore */ }
    return { count: 0, lockoutUntil: 0 };
}

export function setLoginAttempts(attempts) {
    localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(attempts));
}

export function updateLockoutUI() {
    const attempts = getLoginAttempts();
    const now = Date.now();

    if (attempts.lockoutUntil > now) {
        const remainingMinutes = Math.ceil((attempts.lockoutUntil - now) / (1000 * 60));
        if (modalNote) {
            modalNote.innerHTML = `Çok fazla hatalı deneme. Lütfen <strong>${escapeHtml(String(remainingMinutes))} dakika</strong> sonra tekrar deneyin.`;
            modalNote.classList.add('error');
        }
        if (modalOK) modalOK.style.display = 'none';
        const pwInput = document.getElementById('pw');
        if (pwInput) pwInput.disabled = true;

        if (lockoutInterval) clearInterval(lockoutInterval);
        setLockoutInterval(setInterval(updateLockoutUI, 5000));
        return true; // Locked
    } else {
        if (lockoutInterval) clearInterval(lockoutInterval);
        if (modalNote) {
            modalNote.textContent = 'Kasanızı açmak için parolanızı girin.';
            modalNote.classList.remove('error');
        }
        if (modalOK) modalOK.style.display = 'inline-block';
        const pwInput = document.getElementById('pw');
        if (pwInput) pwInput.disabled = false;
        return false; // Not locked
    }
}

export function handleFailedLoginAttempt() {
    let attempts = getLoginAttempts();
    attempts.count++;
    const now = Date.now();
    if (attempts.count >= 9) attempts.lockoutUntil = now + 5 * 60 * 1000; // 5 min
    else if (attempts.count >= 6) attempts.lockoutUntil = now + 3 * 60 * 1000; // 3 min
    else if (attempts.count >= 3) attempts.lockoutUntil = now + 1 * 60 * 1000; // 1 min
    setLoginAttempts(attempts);

    if (attempts.lockoutUntil <= now) {
        if (modalNote) {
            modalNote.textContent = 'Hatalı parola. Lütfen tekrar deneyin.';
            modalNote.classList.add('error');
        }
        if (modalOK) modalOK.style.display = 'inline-block';
    } else {
        updateLockoutUI();
    }
}

export function handleSuccessfulLogin() {
    localStorage.removeItem(LOGIN_ATTEMPTS_KEY);
    if (lockoutInterval) clearInterval(lockoutInterval);
}

// --- Vault Access and Setup ---

export function openVaultAccessMode() {
    // Modal notunu temizle
    if (modalNote) {
        modalNote.textContent = '';
        modalNote.classList.remove('error');
    }

    if (hasVault()) {
        if (modalTitle) modalTitle.textContent = "Kasa Girişi";
        // İlk 5 saniye backdrop click ile kapatmayı engelle (yanlışlıkla kapanmasın)
        showModal(
            `<div class="field"><label>Parola:</label><input id="pw" type="password" autocomplete="off"></div>`,
            'Kasanızı açmak için parolanızı girin.', false, true, false, false, 5
        );
        if (updateLockoutUI()) return;
        if (modalOK) {
            modalOK.textContent = 'Giriş Yap';
            modalOK.onclick = handleVaultUnlock;
        }
    } else {
        if (modalTitle) modalTitle.textContent = "Kasa Kurulumu";
        showModal(
            `<div class="field"><label>Kasa Parolanız (En az 8 karakter):</label><input id="pw1" type="password" autocomplete="off"></div> 
             <div class="field"><label>Parolanızı Doğrulayın:</label><input id="pw2" type="password" autocomplete="off"></div> 
             <div class="no-recovery-warning" style="display: flex; align-items: flex-start; gap: 8px;">
                <span class="confirm-icon warning" style="flex-shrink: 0;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clip-rule="evenodd" /></svg></span>
                <div><strong>Bu parola, kasanızın tek anahtarıdır.</strong> Unutmanız durumunda verilerinize erişmenin başka bir yolu yoktur.</div>
             </div>
             <div style="margin-top: 15px;">
                <div class="checkbox-field" id="termsCheckboxContainer" style="justify-content: flex-start;">
                    <input type="checkbox" id="acceptTermsAndPrivacyCheckbox">
                    <label for="acceptTermsAndPrivacyCheckbox" style="font-size: 14px; color: var(--muted);">
                        <a href="#" id="setupTermsLink" class="link-like" style="font-size: 14px;">Hizmet Koşullarını</a> ve <a href="#" id="setupPrivacyLink" class="link-like" style="font-size: 14px;">Gizlilik Politikasını</a> okudum ve kabul ediyorum.
                    </label>
                </div>
            </div>`,
            '', false, true, false, false, 5
        );
        if (modalOK) {
            modalOK.textContent = 'Parolayı Kaydet';
            modalOK.onclick = handleVaultSetup;
        }

        const setupTermsLink = document.getElementById('setupTermsLink');
        if (setupTermsLink) {
            setupTermsLink.onclick = (e) => {
                e.preventDefault();
                // Setup modal'ını kapat, terms modal'ını aç
                if (modalBackdrop) modalBackdrop.style.display = 'none';
                showTermsModal(false, () => {
                    // Terms modal'ı kapandığında setup modal'ını tekrar aç
                    openVaultAccessMode();
                });
            };
        }

        const setupPrivacyLink = document.getElementById('setupPrivacyLink');
        if (setupPrivacyLink) {
            setupPrivacyLink.onclick = (e) => {
                e.preventDefault();
                // Setup modal'ını kapat, privacy modal'ını aç
                if (modalBackdrop) modalBackdrop.style.display = 'none';
                showSecurityModal(() => {
                    // Privacy modal'ı kapandığında setup modal'ını tekrar aç
                    openVaultAccessMode();
                });
            };
        }

        const restoreBtn = document.createElement('button');
        restoreBtn.className = 'action-toggle-btn';
        restoreBtn.textContent = 'Geri Yükle';

        restoreBtn.onclick = () => {
            const checkbox = document.getElementById('acceptTermsAndPrivacyCheckbox');
            if (checkbox.checked) {
                handleImport();
            } else {
                if (modalNote) {
                    modalNote.textContent = 'Kasayı geri yüklemek için Hizmet Koşulları ve Gizlilik Politikasını kabul etmelisiniz.';
                    modalNote.classList.add('error');
                }
                const container = document.getElementById('termsCheckboxContainer');
                if (container) {
                    container.style.border = '1px solid #ff4444';
                    container.style.borderRadius = '6px';
                    container.style.padding = '8px';
                }
            }
        };
        if (leftActions) leftActions.appendChild(restoreBtn);

        const checkbox = document.getElementById('acceptTermsAndPrivacyCheckbox');
        if (checkbox) {
            checkbox.addEventListener('change', () => {
                if (modalNote) {
                    modalNote.textContent = ''; // Hata mesajını temizle
                    modalNote.classList.remove('error');
                }
                const container = document.getElementById('termsCheckboxContainer');
                if (container) {
                    container.style.border = '';
                    container.style.borderRadius = '';
                    container.style.padding = '';
                }
            });
        }
    }

    // Start inactivity timer with cleanup support
    const abortController = createInactivityAbortController();
    const signal = abortController.signal;

    window.addEventListener('mousemove', resetInactivityTimer, { signal });
    window.addEventListener('keydown', resetInactivityTimer, { signal });
    window.addEventListener('mousedown', resetInactivityTimer, { signal });
    window.addEventListener('touchstart', resetInactivityTimer, { signal, passive: true });
    resetInactivityTimer();

    // Close button handler is now handled in modal-manager.js showModal
}

export async function handleVaultUnlock() {
    const pwVal = document.getElementById('pw').value || '';
    if (!pwVal) {
        if (modalNote) {
            modalNote.textContent = 'Lütfen parolanızı girin.';
            modalNote.classList.add('error');
        }
        return;
    }
    if (modalOK) modalOK.style.display = 'none'; // Prevent double clicks

    try {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (!storedData) {
            if (modalNote) {
                modalNote.textContent = 'Hata: Kasa verisi bulunamadı. Lütfen tekrar deneyin.';
                modalNote.classList.add('error');
            }
            if (modalOK) modalOK.style.display = 'inline-block';
            return;
        }

        // Önce gerçek şifreyi kontrol et
        const enc = JSON.parse(storedData);
        const plainJson = await decryptMessage(pwVal, enc);
        const messages = JSON.parse(plainJson);
        handleSuccessfulLogin();

        // YENİ EKLENEN KISIM: İlk giriş kontrolü
        const shouldShowHowTo = localStorage.getItem(HOW_TO_USE_ON_FIRST_LOGIN_KEY);
        if (shouldShowHowTo === 'true') {
            // İşareti hemen kaldır ki tekrar gösterilmesin.
            localStorage.removeItem(HOW_TO_USE_ON_FIRST_LOGIN_KEY);

            // "Nasıl Kullanılır?" modalını göster.
            // Bu modal kapandığında, asıl kasa yönetimi ekranını göster.
            showHowToUseModal(() => {
                showVaultManagementScreen(pwVal, messages);
            });
            // Bu noktada işlemi durdur, çünkü kasa ekranı daha sonra gösterilecek.
            return;
        }
        // --- YENİ EKLENEN KISIM SONU ---

        // Umami Analytics: Kasa girişi
        if (typeof umami !== 'undefined' && typeof umami.track === 'function') {
            umami.track('vault_login', { notes_count: messages.length });
        }
        setCurrentVaultPassword(pwVal);
        showVaultManagementScreen(pwVal, messages);
    } catch (e) {
        // Gerçek şifre başarısız, sahte parolayı kontrol et
        try {
            // Önce yeni anahtarı kontrol et
            let honeyPasswordData = localStorage.getItem(HONEY_PASSWORD_KEY);
            // Yeni anahtar yoksa eski anahtarı kontrol et ve migrate et
            if (!honeyPasswordData) {
                const oldData = localStorage.getItem(OLD_HONEY_PASSWORD_KEY);
                if (oldData) {
                    try {
                        const parsed = JSON.parse(oldData);
                        if (parsed.salt && parsed.hash) {
                            // Eski format hash ise yeni anahtara taşı
                            localStorage.setItem(HONEY_PASSWORD_KEY, oldData);
                            const oldVault = localStorage.getItem(OLD_HONEY_VAULT_KEY);
                            if (oldVault) localStorage.setItem(HONEY_VAULT_KEY, oldVault);
                            localStorage.removeItem(OLD_HONEY_PASSWORD_KEY);
                            localStorage.removeItem(OLD_HONEY_VAULT_KEY);
                            honeyPasswordData = oldData;
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

            if (honeyPasswordData) {
                try {
                    const honeyData = JSON.parse(honeyPasswordData);
                    // Yeni format kontrolü (hash)
                    if (honeyData.salt && honeyData.hash) {
                        const isHoneyPassword = await verifyHoneyPassword(pwVal, honeyData);
                        if (isHoneyPassword) {
                            // Sahte parola doğru - boş kasa göster
                            handleSuccessfulLogin();
                            const honeyVault = localStorage.getItem(HONEY_VAULT_KEY);
                            let honeyMessages = [];
                            if (honeyVault) {
                                try {
                                    const honeyEnc = JSON.parse(honeyVault);
                                    const honeyPlainJson = await decryptMessage(pwVal, honeyEnc);
                                    honeyMessages = JSON.parse(honeyPlainJson);
                                } catch (err) {
                                    // Sahte kasa yoksa boş kasa göster
                                    honeyMessages = [];
                                }
                            }
                            // Umami Analytics: Sahte parola giris̏i
                            if (typeof umami !== 'undefined' && typeof umami.track === 'function') {
                                umami.track('honey_password_login');
                            }
                            showVaultManagementScreen(pwVal, honeyMessages);
                            return;
                        }
                    } else {
                        // Geçersiz format - sil
                        localStorage.removeItem(HONEY_PASSWORD_KEY);
                        localStorage.removeItem(HONEY_VAULT_KEY);
                    }
                } catch (parseError) {
                    // Geçersiz format - sil
                    localStorage.removeItem(HONEY_PASSWORD_KEY);
                    localStorage.removeItem(HONEY_VAULT_KEY);
                }
            }
        } catch (honeyError) {
            // Sahte parola kontrolü başarısız, normal hata işleme devam et
        }
        // Hem gerçek hem sahte parola başarısız
        handleFailedLoginAttempt();
    }
}

export async function handleVaultSetup() {
    const p1 = document.getElementById('pw1').value || '';
    const p2 = document.getElementById('pw2').value || '';
    const acceptTermsAndPrivacyCheckbox = document.getElementById('acceptTermsAndPrivacyCheckbox');

    if (!acceptTermsAndPrivacyCheckbox || !acceptTermsAndPrivacyCheckbox.checked) {
        if (modalNote) {
            modalNote.textContent = 'Kasayı oluşturmak için Hizmet Koşulları ve Gizlilik Politikasını kabul etmelisiniz.';
            modalNote.classList.add('error');
        }
        const container = document.getElementById('termsCheckboxContainer');
        if (container) {
            container.style.border = '1px solid #ff4444';
            container.style.borderRadius = '6px';
            container.style.padding = '8px';
        }
        return;
    }

    if (p1.length < 8) {
        showModal(modalContent.innerHTML, 'Lütfen en az 8 karakterden oluşan güçlü bir parola belirleyin.', true, true, false, false);
        return;
    }
    if (p1 !== p2) {
        showModal(modalContent.innerHTML, 'Parolalar eşleşmiyor.', true, true, false, false);
        return;
    }

    try {
        const initialData = JSON.stringify([]);
        const enc = await encryptMessage(p1, initialData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(enc));
        localStorage.setItem(TERMS_KEY, 'true');
        // YENİ EKLENDİ: İlk girişte yardım gösterilmesi için işaret bırak.
        localStorage.setItem(HOW_TO_USE_ON_FIRST_LOGIN_KEY, 'true');
        // YENİ İSTEK: Başlangıçta karşılama ekranını gizle ayarını aktif et.
        localStorage.setItem('hesapp_show_welcome_on_startup', 'false');

        // Umami Analytics: Kasa olus̏turma
        if (typeof umami !== 'undefined' && typeof umami.track === 'function') {
            umami.track('vault_created');
        }

        setCurrentVaultPassword(p1);

        // "Nasıl Kullanılır?" modalını göster, kapandığında kasa ekranına geç. (Önceki stabil haline geri dönüldü)
        showHowToUseModal(() => {
            showVaultManagementScreen(p1, []);
        });
    } catch (e) {
        showModal(modalContent.innerHTML, '⚠️ Hata: Depolama alanına yazılamadı (Kotanız dolu olabilir ya da Gizli Mod açık olabilir).', true, true, false, false);
    }
}
