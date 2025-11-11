import { showCustomToast } from '../toast.js';
import { encryptMessage, decryptMessage, createHoneyPasswordHash, verifyHoneyPassword } from './crypto.js';
import { resetInactivityTimer } from './vault.js';

const modalBackdrop = document.getElementById('modalBackdrop');
const modalContent = document.getElementById('modalContent');
const modalOK = document.getElementById('modalOK');
const modalCancel = document.getElementById('modalCancel');
const leftActions = document.getElementById('leftActions');
const modalNote = document.getElementById('modalNote');
const modalTitle = document.getElementById('modalTitle');
const vaultCloseBtn = document.getElementById('vaultCloseBtn');
const vaultBackBtn = document.getElementById('vaultBackBtn');
const securityBackdrop = document.getElementById('securityBackdrop');
const securityClose = document.getElementById('securityClose');
const infoDropdownContainer = document.getElementById('infoDropdownContainer');
const settingsDropdownContainer = document.getElementById('settingsDropdownContainer');
const infoBtn = document.getElementById('infoBtn');
const settingsBtn = document.getElementById('settingsBtn');
const infoDropdown = document.getElementById('infoDropdown');
const termsBackdrop = document.getElementById('termsBackdrop');
const termsActions = document.getElementById('termsActions');
const aboutBackdrop = document.getElementById('aboutBackdrop');
const aboutClose = document.getElementById('aboutClose');
const howToUseBackdrop = document.getElementById('howToUseBackdrop');
const howToUseClose = document.getElementById('howToUseClose');
const howToUseOK = document.getElementById('howToUseOK');
const autoLockModalBackdrop = document.getElementById('autoLockModalBackdrop');
const changePasswordBackdrop = document.getElementById('changePasswordBackdrop');
const honeyPasswordBackdrop = document.getElementById('honeyPasswordBackdrop');
const appearanceModalBackdrop = document.getElementById('appearanceModalBackdrop');
const themeModalBackdrop = document.getElementById('themeModalBackdrop');

const STORAGE_KEY = 'kasa_encrypted_v1';
const TERMS_KEY = 'hesapp_terms_accepted_v1';
// Sahte parola için localStorage anahtarları (gizlilik için genel isimler)
const HONEY_PASSWORD_KEY = 'hesapp_aux_key_v1';
const HONEY_VAULT_KEY = 'hesapp_aux_data_v1';
// Eski anahtar adları (migration için)
const OLD_HONEY_PASSWORD_KEY = 'hesapp_honey_password_v1';
const OLD_HONEY_VAULT_KEY = 'hesapp_honey_vault_v1';
const LOGIN_ATTEMPTS_KEY = 'hesapp_login_attempts_v1';
let lockoutInterval;
let currentVaultPassword = null; // Aktif kasa şifresini sakla

// XSS koruması: HTML escape fonksiyonu
function escapeHtml(text) {
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

// --- Confirmation Modal ---
const confirmBackdrop = document.getElementById('confirmBackdrop');
const confirmMessage = document.getElementById('confirmMessage');
const confirmOK = document.getElementById('confirmOK');
const confirmCancel = document.getElementById('confirmCancel');
let confirmationResolver;

function showConfirmation(message, okText = 'Evet, Sil', cancelText = 'İptal') {
    confirmMessage.innerHTML = message;
    confirmOK.textContent = okText;
    confirmCancel.textContent = cancelText;
    confirmOK.className = okText.includes('Sil') || okText.includes('Yükle') ? 'delete-btn' : 'vault-btn';
    confirmBackdrop.style.display = 'flex';
    return new Promise(resolve => {
        confirmationResolver = resolve;
    });
}
confirmOK.onclick = () => { confirmBackdrop.style.display = 'none'; if (confirmationResolver) confirmationResolver(true); };
confirmCancel.onclick = () => { confirmBackdrop.style.display = 'none'; if (confirmationResolver) confirmationResolver(false); };

// --- Main Modal Logic ---
export function showModal(html, note = '', isError = false, showInfo = false, showSettings = false, showBack = false) {
    modalContent.innerHTML = html;
    modalNote.innerHTML = note;
    modalNote.classList.toggle('error', isError);
    modalBackdrop.style.display = 'flex';

    // Yeni modal butonlarını göster/gizle
    infoBtn.style.display = showInfo ? 'flex' : 'none';
    settingsBtn.style.display = showSettings ? 'flex' : 'none';
    vaultBackBtn.style.display = showBack ? 'flex' : 'none';

    modalOK.style.display = 'inline-block';
    modalCancel.style.display = 'none';
    leftActions.innerHTML = '';

    // Disable calculator key handler
    // This was handled by a global flag, now we need a better way.
    // For now, we assume the calculator handler checks for active inputs.

    setTimeout(() => {
        const firstInput = modalBackdrop.querySelector('input, textarea');
        if (firstInput) firstInput.focus();
        modalBackdrop.querySelectorAll('input[type="password"], input[type="text"]').forEach(input => {
            input.addEventListener('keydown', modalInputKeyHandler);
        });
    }, 40);
}

export function hideModal() {
    modalBackdrop.style.display = 'none';
    securityBackdrop.style.display = 'none';
    termsBackdrop.style.display = 'none';
    aboutBackdrop.style.display = 'none';
    howToUseBackdrop.style.display = 'none';
    autoLockModalBackdrop.style.display = 'none';
    changePasswordBackdrop.style.display = 'none';
    appearanceModalBackdrop.style.display = 'none';
    if (themeModalBackdrop) themeModalBackdrop.style.display = 'none';
    document.getElementById('settingsModalBackdrop').style.display = 'none';
    document.getElementById('infoModalBackdrop').style.display = 'none';
    if (confirmBackdrop) confirmBackdrop.style.display = 'none';
    infoDropdown.classList.remove('show-dropdown');
    document.getElementById('settingsDropdown').classList.remove('show-dropdown');

    modalBackdrop.querySelectorAll('input[type="password"], input[type="text"]').forEach(input => {
        input.removeEventListener('keydown', modalInputKeyHandler);
    });

    // Re-enable calculator key handler logic would go here if needed.
}

function modalInputKeyHandler(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        if (modalOK.onclick && typeof modalOK.onclick === 'function') {
            modalOK.onclick();
        }
    }
}

function hasVault() {
    return Boolean(localStorage.getItem(STORAGE_KEY));
}

// --- Brute-Force Protection ---
function getLoginAttempts() {
    try {
        const data = JSON.parse(localStorage.getItem(LOGIN_ATTEMPTS_KEY));
        if (data && typeof data.count === 'number' && typeof data.lockoutUntil === 'number') {
            return data;
        }
    } catch (e) { /* ignore */ }
    return { count: 0, lockoutUntil: 0 };
}

function setLoginAttempts(attempts) {
    localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(attempts));
}

function updateLockoutUI() {
    const attempts = getLoginAttempts();
    const now = Date.now();

    if (attempts.lockoutUntil > now) {
        const remainingMinutes = Math.ceil((attempts.lockoutUntil - now) / (1000 * 60));
        modalNote.innerHTML = `Çok fazla hatalı deneme. Lütfen <strong>${escapeHtml(String(remainingMinutes))} dakika</strong> sonra tekrar deneyin.`;
        modalNote.classList.add('error');
        modalOK.style.display = 'none';
        document.getElementById('pw').disabled = true;

        clearInterval(lockoutInterval);
        lockoutInterval = setInterval(updateLockoutUI, 5000);
        return true; // Locked
    } else {
        clearInterval(lockoutInterval);
        modalNote.textContent = 'Kasanızı açmak için parolanızı girin.';
        modalNote.classList.remove('error');
        modalOK.style.display = 'inline-block';
        const pwInput = document.getElementById('pw');
        if (pwInput) pwInput.disabled = false;
        return false; // Not locked
    }
}

function handleFailedLoginAttempt() {
    let attempts = getLoginAttempts();
    attempts.count++;
    const now = Date.now();
    if (attempts.count >= 9) attempts.lockoutUntil = now + 5 * 60 * 1000; // 5 min
    else if (attempts.count >= 6) attempts.lockoutUntil = now + 3 * 60 * 1000; // 3 min
    else if (attempts.count >= 3) attempts.lockoutUntil = now + 1 * 60 * 1000; // 1 min
    setLoginAttempts(attempts);

    if (attempts.lockoutUntil <= now) {
        modalNote.textContent = 'Hatalı parola. Lütfen tekrar deneyin.';
        modalNote.classList.add('error');
        modalOK.style.display = 'inline-block';
    } else {
        updateLockoutUI();
    }
}

function handleSuccessfulLogin() {
    localStorage.removeItem(LOGIN_ATTEMPTS_KEY);
    clearInterval(lockoutInterval);
}

// --- Vault Access and Setup ---
export function openVaultAccessMode() {
    // Modal notunu temizle
    modalNote.textContent = '';
    modalNote.classList.remove('error');
    
    if (hasVault()) {
        modalTitle.textContent = "Kasa Girişi";
        showModal(
            `<div class="field"><label>Parola:</label><input id="pw" type="password" autocomplete="off"></div>`,
            'Kasanızı açmak için parolanızı girin.', false, true, false, false
        );
        if (updateLockoutUI()) return;
        modalOK.textContent = 'Giriş Yap';
        modalOK.onclick = handleVaultUnlock;
    } else {
        modalTitle.textContent = "Kasa Kurulumu";
        showModal(
            `<div class="field"><label>Kasa Parolanız (En az 8 karakter):</label><input id="pw1" type="password" autocomplete="off"></div> 
             <div class="field"><label>Parolanızı Doğrulayın:</label><input id="pw2" type="password" autocomplete="off"></div> 
             <div class="no-recovery-warning" style="display: flex; align-items: flex-start; gap: 8px;">
                <span class="confirm-icon warning" style="flex-shrink: 0;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clip-rule="evenodd" /></svg></span>
                <div><strong>Bu parola, kasanızın tek anahtarıdır.</strong> Unutmanız durumunda verilerinize erişmenin başka bir yolu yoktur.</div>
             </div>
             <div class="checkbox-field" style="margin-top: 15px; justify-content: center;">
                <input type="checkbox" id="acceptTermsCheckbox">
                <label for="acceptTermsCheckbox" style="font-size: 14px; color: var(--muted);">
                    <a href="#" id="setupTermsLink" class="link-like" style="font-size: 14px;">Hizmet Sözleşmesini</a> okudum ve kabul ediyorum.
                </label>
            </div>`,
            '', false, true, false, false
        );
        modalOK.textContent = 'Parolayı Kaydet';
        modalOK.onclick = handleVaultSetup;

        document.getElementById('setupTermsLink').onclick = (e) => { e.preventDefault(); showTermsModal(false); };

        const restoreBtn = document.createElement('button');
        restoreBtn.className = 'action-toggle-btn';
        restoreBtn.textContent = 'Geri Yükle';
        restoreBtn.onclick = handleImport;
        leftActions.appendChild(restoreBtn);
    }

    // Start inactivity timer
    window.addEventListener('mousemove', resetInactivityTimer);
    window.addEventListener('keydown', resetInactivityTimer);
    window.addEventListener('mousedown', resetInactivityTimer);
    window.addEventListener('touchstart', resetInactivityTimer);
    resetInactivityTimer();
}

async function handleVaultUnlock() {
    const pwVal = document.getElementById('pw').value || '';
    if (!pwVal) {
        modalNote.textContent = 'Lütfen parolanızı girin.';
        modalNote.classList.add('error');
        return;
    }
    modalOK.style.display = 'none'; // Prevent double clicks

    try {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (!storedData) {
            modalNote.textContent = 'Hata: Kasa verisi bulunamadı. Lütfen tekrar deneyin.';
            modalNote.classList.add('error');
            modalOK.style.display = 'inline-block';
            return;
        }
        
        // Önce gerçek şifreyi kontrol et
        const enc = JSON.parse(storedData);
        const plainJson = await decryptMessage(pwVal, enc);
        const messages = JSON.parse(plainJson);
        handleSuccessfulLogin();
        // Google Analytics event: Kasa girişi
        if (typeof gtag === 'function') {
            gtag('event', 'vault_login', {
                'event_category': 'Kasa',
                'event_label': 'Başarılı Giriş',
                'value': messages.length // Not sayısı
            });
        }
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
                            // Google Analytics event: Sahte parola girişi
                            if (typeof gtag === 'function') {
                                gtag('event', 'honey_password_login', {
                                    'event_category': 'Kasa',
                                    'event_label': 'Sahte Parola Girişi'
                                });
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

async function handleVaultSetup() {
    const p1 = document.getElementById('pw1').value || '';
    const p2 = document.getElementById('pw2').value || '';
    const acceptTermsCheckbox = document.getElementById('acceptTermsCheckbox');

    if (!acceptTermsCheckbox || !acceptTermsCheckbox.checked) {
        modalNote.textContent = 'Kasayı oluşturmak için hizmet sözleşmesini kabul etmelisiniz.';
        modalNote.classList.add('error');
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
        // Google Analytics event: Kasa oluşturma
        if (typeof gtag === 'function') {
            gtag('event', 'vault_created', {
                'event_category': 'Kasa',
                'event_label': 'Yeni Kasa Oluşturuldu',
                'value': 1
            });
        }
        showVaultManagementScreen(p1, []);
    } catch (e) {
        showModal(modalContent.innerHTML, '⚠️ Hata: Depolama alanına yazılamadı (Kotanız dolu olabilir ya da Gizli Mod açık olabilir).', true, true, false, false);
    }
}

// --- Vault Management Screen ---
export function showVaultManagementScreen(password, messages) {
    currentVaultPassword = password; // Aktif şifreyi sakla
    modalTitle.textContent = "Kasa Yönetimi";
    modalNote.textContent = ''; // Hata mesajlarını temizle
    modalNote.classList.remove('error');
    showModal('', '', false, true, true, false);
    resetInactivityTimer();

    modalContent.innerHTML = `
        ${messages.length > 0 ? `
        <div class="search-field">
            <span class="search-icon"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg></span>
            <input type="text" id="noteSearchInput" placeholder="Notlarda ara..." autocomplete="off">
        </div>
        <div class="note-filter-buttons" style="display:flex; gap:8px; margin-bottom:12px; margin-top:8px;">
            <button class="filter-btn active" data-filter="all" style="padding:6px 12px; border-radius:8px; border:1px solid var(--modal-border); background:var(--input-bg); color:var(--input-text); font-size:13px; cursor:pointer; transition:all 0.2s;">Tümü</button>
            <button class="filter-btn" data-filter="important" style="padding:6px 12px; border-radius:8px; border:1px solid var(--modal-border); background:var(--input-bg); color:var(--input-text); font-size:13px; cursor:pointer; transition:all 0.2s;">Favoriler</button>
            <button class="filter-btn" data-filter="normal" style="padding:6px 12px; border-radius:8px; border:1px solid var(--modal-border); background:var(--input-bg); color:var(--input-text); font-size:13px; cursor:pointer; transition:all 0.2s;">Normal</button>
        </div>` : ''}
        <div id="messageList" style="max-height: 250px; overflow-y: auto; margin-bottom: 15px;"></div>
    `;

    const messageListContainer = document.getElementById('messageList');
    const searchInput = document.getElementById('noteSearchInput');
    let currentFilter = 'all';

    function renderMessageList(messagesToRender) {
        // Filtreleme uygula
        let filteredMessages = messagesToRender;
        if (currentFilter === 'important') {
            filteredMessages = messagesToRender.filter(msg => msg.isImportant === true);
        } else if (currentFilter === 'normal') {
            filteredMessages = messagesToRender.filter(msg => !msg.isImportant);
        }
        // Öncelikli notları önce göster, sonra tarihe göre sırala
        const sortedMessages = [...filteredMessages].sort((a, b) => {
            const aImportant = a.isImportant ? 1 : 0;
            const bImportant = b.isImportant ? 1 : 0;
            if (aImportant !== bImportant) return bImportant - aImportant;
            return new Date(b.date) - new Date(a.date);
        });
        const noResultMessage = searchInput && searchInput.value ? 'Aramanızla eşleşen not bulunamadı.' : (currentFilter !== 'all' ? 'Bu filtreye uygun not bulunamadı.' : 'Henüz bir not eklenmedi.');
        messageListContainer.innerHTML = sortedMessages.length > 0 ? sortedMessages.map(msg => {
            const originalIndex = messages.indexOf(msg);
            return `
            <div class="message-item view-btn" data-index="${originalIndex}" style="display:flex; justify-content:space-between; align-items:center; cursor: pointer; padding: 12px 5px; border-bottom: 1px solid var(--modal-border);">
                <div style="display:flex; align-items:center; gap:8px; max-width: 60%; flex:1;">
                    <span class="view-title" style="font-weight:600; color:var(--accent); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(msg.title || 'Başlıksız Not')}</span>
                </div>
                <div style="display:flex; align-items:center; gap:8px;">
                    <div style="width:18px; height:18px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                        ${msg.isImportant ? `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" style="width:18px; height:18px; color:#ff9500;"><path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg>` : ''}
                    </div>
                    <div class="message-date">${escapeHtml(formatVaultDate(msg.date))}</div>
                </div>
            </div>
            `;
        }).join('') : `<p style="color:var(--muted); text-align:center; padding: 20px 0;">${escapeHtml(noResultMessage)}</p>`;

        messageListContainer.querySelectorAll('.message-item').forEach(item => {
            item.onclick = (e) => {
                const originalIndex = parseInt(e.currentTarget.dataset.index);
                showMessageEditor(password, messages, originalIndex);
            };
        });
    }

    // Filtre butonları
    const filterButtons = document.querySelectorAll('.filter-btn');
    if (filterButtons.length > 0) {
        // İlk butonu aktif yap
        filterButtons[0].style.background = 'var(--accent)';
        filterButtons[0].style.color = '#fff';
        filterButtons[0].style.borderColor = 'var(--accent)';
        
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => {
                    b.classList.remove('active');
                    b.style.background = 'var(--input-bg)';
                    b.style.color = 'var(--input-text)';
                    b.style.borderColor = 'var(--modal-border)';
                });
                btn.classList.add('active');
                btn.style.background = 'var(--accent)';
                btn.style.color = '#fff';
                btn.style.borderColor = 'var(--accent)';
                currentFilter = btn.dataset.filter;
                if (searchInput && searchInput.value) {
                    const searchTerm = searchInput.value.toLowerCase();
                    const filtered = messages.filter(msg =>
                        (msg.title && msg.title.toLowerCase().includes(searchTerm)) ||
                        (msg.content && msg.content.toLowerCase().includes(searchTerm))
                    );
                    renderMessageList(filtered);
                } else {
                    renderMessageList(messages);
                }
            });
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filtered = messages.filter(msg =>
                (msg.title && msg.title.toLowerCase().includes(searchTerm)) ||
                (msg.content && msg.content.toLowerCase().includes(searchTerm))
            );
            renderMessageList(filtered);
        });
    }

    renderMessageList(messages);

    // Buton metnini ve işlevini ayarla
    modalOK.textContent = 'Yeni Not Ekle';
    modalOK.onclick = () => showMessageEditor(password, messages, -1);

    // Klavye kısayolları
    const handleVaultShortcuts = (e) => {
        // Ctrl/Cmd + N: Yeni not
        if ((e.ctrlKey || e.metaKey) && e.key === 'n' && !e.shiftKey) {
            e.preventDefault();
            showMessageEditor(password, messages, -1);
            return;
        }
        // Ctrl/Cmd + F: Arama odağı
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            const searchInput = document.getElementById('noteSearchInput');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
            return;
        }
    };
    document.addEventListener('keydown', handleVaultShortcuts);
    
    // Cleanup için modal kapanınca event listener'ı kaldır
    const originalHideModal = hideModal;
    hideModal = function() {
        document.removeEventListener('keydown', handleVaultShortcuts);
        originalHideModal();
    };
}

function showMessageEditor(password, messages, index) {
    const isNew = index === -1;
    const msg = isNew ? { title: '', content: '', date: new Date().toISOString(), creationDate: new Date().toISOString(), isImportant: false } : { ...messages[index] };
    // Eski notlar için isImportant varsayılanı
    if (msg.isImportant === undefined) msg.isImportant = false;
    let isCurrentlyEditing = isNew;

    function updateEditorUI() {
        const isEditing = isCurrentlyEditing;
        modalTitle.textContent = isNew ? "Yeni Not Ekle" : (isEditing ? "Notu Düzenle" : "Not");

        showModal(
            `<div class="field"><label>Başlık:</label><input id="msgTitle" type="text" value="${escapeHtml(msg.title)}" placeholder="Not Başlığı (Opsiyonel)" ${!isEditing ? 'readonly' : ''}></div>
             <div class="field">
                 <label>İçerik:</label>
                 <div class="copy-container">
                     <textarea id="msgContent" rows="5" placeholder="Gizli mesajınızın içeriği" ${!isEditing ? 'readonly' : ''}>${escapeHtml(msg.content)}</textarea>
                     ${!isNew && !isEditing ? `
                     <div class="icon-actions">
                         <button class="icon-btn visibility-btn" id="showContentBtn" title="İçeriği Göster" style="display: none;">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                         </button>
                         <button class="icon-btn visibility-btn" id="hideContentBtn" title="İçeriği Gizle">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                         </button>
                         <button class="icon-btn copy-btn" id="copyMsgBtn" title="Panoya Kopyala">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" /></svg>
                         </button>
                     </div>
                     ` : ''}
                 </div>
             </div>
             ${!isNew && msg.isImportant && !isEditing ? `
             <div style="display:flex; align-items:center; gap:6px; margin-top:8px; padding:8px; background:rgba(255,149,0,0.1); border-radius:8px; border:1px solid rgba(255,149,0,0.3);">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:18px; height:18px; color:#ff9500;"><path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg>
                <span style="font-size:13px; color:#ff9500; font-weight:600;">Favori Not</span>
            </div>` : ''}
             <div class="note-dates">
                ${!isNew && msg.creationDate ? `<div>Oluşturulma: ${escapeHtml(formatVaultDate(msg.creationDate))}</div>` : ''}
                ${!isNew ? `<div>Son Değişiklik: ${escapeHtml(formatVaultDate(msg.date))}</div>` : ''}
             </div>
             ${isEditing ? `
             <div class="field" style="margin-top: 12px;">
                <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                    <input type="checkbox" id="msgImportant" ${msg.isImportant ? 'checked' : ''} style="width:18px; height:18px; cursor:pointer; accent-color:var(--accent);">
                    <span style="display:flex; align-items:center; gap:6px;">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:18px; height:18px; color:#ff9500;"><path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg>
                        <span>Favorilere ekle</span>
                    </span>
                </label>
             </div>` : ''}`,
            '', false, false, false, true
        );

        vaultBackBtn.onclick = () => showVaultManagementScreen(password, messages);
        vaultBackBtn.style.display = isEditing ? 'none' : 'flex';

        leftActions.innerHTML = '';
        modalCancel.style.display = 'none';

        if (isNew) {
            modalOK.textContent = 'Kaydet';
            modalOK.onclick = () => handleSaveMessage(password, messages, index);
            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'action-toggle-btn';
            cancelBtn.textContent = 'Vazgeç';
            cancelBtn.onclick = () => showVaultManagementScreen(password, messages);
            leftActions.appendChild(cancelBtn);
        } else if (isEditing) {
            modalOK.textContent = 'Güncelle';
            modalOK.onclick = () => handleSaveMessage(password, messages, index);
            const cancelEditBtn = document.createElement('button');
            cancelEditBtn.className = 'action-toggle-btn';
            cancelEditBtn.textContent = 'Vazgeç';
            cancelEditBtn.onclick = () => {
                isCurrentlyEditing = false;
                updateEditorUI();
            };
            leftActions.appendChild(cancelEditBtn);
        } else { // View mode
            modalOK.textContent = 'Düzenle';
            modalOK.onclick = () => {
                isCurrentlyEditing = true;
                updateEditorUI();
            };
            const deleteNoteBtn = document.createElement('button');
            deleteNoteBtn.className = 'delete-btn';
            deleteNoteBtn.textContent = 'Notu Sil';
            deleteNoteBtn.onclick = () => handleDeleteMessage(password, messages, index);
            leftActions.appendChild(deleteNoteBtn);

            // Setup view mode actions (copy, hide/show)
            const copyBtn = document.getElementById('copyMsgBtn');
            if (copyBtn) {
                copyBtn.onclick = (e) => {
                    const buttonElement = e.currentTarget;
                    const originalIcon = buttonElement.innerHTML;
                    navigator.clipboard.writeText(msg.content).then(() => {
                        showCustomToast('İçerik kopyalandı!');
                        buttonElement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="color: #28a745;"><path fill-rule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 0 1 1.04-.208Z" clip-rule="evenodd" /></svg>`;
                        setTimeout(() => { buttonElement.innerHTML = originalIcon; }, 1500);
                    });
                };
            }

            const showBtn = document.getElementById('showContentBtn');
            const hideBtn = document.getElementById('hideContentBtn');
            const contentArea = document.getElementById('msgContent');
            if (showBtn && hideBtn && contentArea) {
                hideBtn.onclick = () => {
                    contentArea.value = '********************';
                    hideBtn.style.display = 'none';
                    showBtn.style.display = 'flex';
                };
                showBtn.onclick = () => {
                    contentArea.value = msg.content;
                    showBtn.style.display = 'none';
                    hideBtn.style.display = 'flex';
                };
                hideBtn.click(); // Start with content hidden
            }
        }

        if (isEditing) {
            setTimeout(() => document.getElementById('msgTitle').focus(), 50);
            
            // Klavye kısayolları: Ctrl/Cmd + S: Kaydet
            const handleEditorShortcuts = (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                    e.preventDefault();
                    handleSaveMessage(password, messages, index);
                    return;
                }
            };
            document.addEventListener('keydown', handleEditorShortcuts);
            
            // Cleanup için düzenleme modundan çıkınca event listener'ı kaldır
            const originalUpdateEditorUI = updateEditorUI;
            updateEditorUI = function() {
                if (!isCurrentlyEditing) {
                    document.removeEventListener('keydown', handleEditorShortcuts);
                }
                originalUpdateEditorUI();
            };
        }
    }

    updateEditorUI();
}

async function handleSaveMessage(password, messages, index) {
    const title = document.getElementById('msgTitle').value.trim();
    const content = document.getElementById('msgContent').value.trim();
    const isImportant = document.getElementById('msgImportant') ? document.getElementById('msgImportant').checked : false;

    if (content === '') {
        modalNote.textContent = 'Mesaj içeriği boş olamaz!';
        modalNote.classList.add('error');
        return;
    }

    let finalTitle = title;
    if (!finalTitle) {
        const baseTitle = 'Başlıksız Not';
        // Diğer notların başlıklarını kontrol et (mevcut notu düzenliyorsak hariç tut)
        const otherTitles = messages
            .filter((_, i) => i !== index)
            .map(m => m.title);

        if (!otherTitles.includes(baseTitle)) {
            finalTitle = baseTitle;
        } else {
            let counter = 2;
            while (otherTitles.includes(`${baseTitle} ${counter}`)) {
                counter++;
            }
            finalTitle = `${baseTitle} ${counter}`;
        }
    }

    const originalMessage = index !== -1 ? messages[index] : null;
    const newMessage = {
        title: finalTitle,
        content: content,
        date: new Date().toISOString(),
        creationDate: originalMessage ? (originalMessage.creationDate || originalMessage.date) : new Date().toISOString(),
        isImportant: isImportant
    };

    if (index === -1) {
        messages.push(newMessage);
        // Google Analytics event: Not oluşturma
        if (typeof gtag === 'function') {
            gtag('event', 'note_created', {
                'event_category': 'Kasa',
                'event_label': 'Yeni Not Oluşturuldu',
                'value': messages.length + 1
            });
        }
    } else {
        messages[index] = newMessage;
        // Google Analytics event: Not düzenleme
        if (typeof gtag === 'function') {
            gtag('event', 'note_edited', {
                'event_category': 'Kasa',
                'event_label': 'Not Düzenlendi'
            });
        }
    }

    try {
        // Sahte parola ile mi giriş yapıldı kontrol et (hash ile)
        let isHoneyPassword = false;
        let honeyPasswordData = localStorage.getItem(HONEY_PASSWORD_KEY);
        if (!honeyPasswordData) {
            // Eski anahtardan migrate et
            const oldData = localStorage.getItem(OLD_HONEY_PASSWORD_KEY);
            if (oldData) {
                try {
                    const parsed = JSON.parse(oldData);
                    if (parsed.salt && parsed.hash) {
                        localStorage.setItem(HONEY_PASSWORD_KEY, oldData);
                        const oldVault = localStorage.getItem(OLD_HONEY_VAULT_KEY);
                        if (oldVault) localStorage.setItem(HONEY_VAULT_KEY, oldVault);
                        localStorage.removeItem(OLD_HONEY_PASSWORD_KEY);
                        localStorage.removeItem(OLD_HONEY_VAULT_KEY);
                        honeyPasswordData = oldData;
                    }
                } catch (e) {
                    localStorage.removeItem(OLD_HONEY_PASSWORD_KEY);
                    localStorage.removeItem(OLD_HONEY_VAULT_KEY);
                }
            }
        }
        if (honeyPasswordData) {
            try {
                const honeyData = JSON.parse(honeyPasswordData);
                if (honeyData.salt && honeyData.hash) {
                    isHoneyPassword = await verifyHoneyPassword(password, honeyData);
                }
            } catch (e) {
                // Geçersiz format - devam et
            }
        }
        
        if (isHoneyPassword) {
            // Sahte kasa güncelle
            const enc = await encryptMessage(password, JSON.stringify(messages));
            localStorage.setItem(HONEY_VAULT_KEY, JSON.stringify(enc));
        } else {
            // Gerçek kasa güncelle
            const enc = await encryptMessage(password, JSON.stringify(messages));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(enc));
        }
        showVaultManagementScreen(password, messages);
    } catch (e) {
        modalNote.innerHTML = 'Hata: Depolama alanına yazılamadı.';
        modalNote.classList.add('error');
    }
}

async function handleDeleteMessage(password, messages, index) {
    const confirmed = await showConfirmation("Bu gizli notu kalıcı olarak silmek istediğinizden emin misiniz?");
    if (confirmed) {
        messages.splice(index, 1);
        // Google Analytics event: Not silme
        if (typeof gtag === 'function') {
            gtag('event', 'note_deleted', {
                'event_category': 'Kasa',
                'event_label': 'Not Silindi',
                'value': messages.length - 1
            });
        }
        try {
            // Sahte parola ile mi giriş yapıldı kontrol et (hash ile)
            let isHoneyPassword = false;
            let honeyPasswordData = localStorage.getItem(HONEY_PASSWORD_KEY);
            if (!honeyPasswordData) {
                // Eski anahtardan migrate et
                const oldData = localStorage.getItem(OLD_HONEY_PASSWORD_KEY);
                if (oldData) {
                    try {
                        const parsed = JSON.parse(oldData);
                        if (parsed.salt && parsed.hash) {
                            localStorage.setItem(HONEY_PASSWORD_KEY, oldData);
                            const oldVault = localStorage.getItem(OLD_HONEY_VAULT_KEY);
                            if (oldVault) localStorage.setItem(HONEY_VAULT_KEY, oldVault);
                            localStorage.removeItem(OLD_HONEY_PASSWORD_KEY);
                            localStorage.removeItem(OLD_HONEY_VAULT_KEY);
                            honeyPasswordData = oldData;
                        }
                    } catch (e) {
                        localStorage.removeItem(OLD_HONEY_PASSWORD_KEY);
                        localStorage.removeItem(OLD_HONEY_VAULT_KEY);
                    }
                }
            }
            if (honeyPasswordData) {
                try {
                    const honeyData = JSON.parse(honeyPasswordData);
                    if (honeyData.salt && honeyData.hash) {
                        isHoneyPassword = await verifyHoneyPassword(password, honeyData);
                    }
                } catch (e) {
                    // Geçersiz format - devam et
                }
            }
            
            if (isHoneyPassword) {
                // Sahte kasa güncelle
                const enc = await encryptMessage(password, JSON.stringify(messages));
                localStorage.setItem(HONEY_VAULT_KEY, JSON.stringify(enc));
            } else {
                // Gerçek kasa güncelle
                const enc = await encryptMessage(password, JSON.stringify(messages));
                localStorage.setItem(STORAGE_KEY, JSON.stringify(enc));
            }
            showVaultManagementScreen(password, messages);
        } catch (e) {
            modalNote.textContent = 'Hata: Silme sonrası kayıt başarısız oldu. Lütfen tekrar deneyin.';
            modalNote.classList.add('error');
            showCustomToast('Not silinemedi. Lütfen tekrar deneyin.');
        }
    }
}

// --- Import / Export ---
function handleExport() {
    // Google Analytics event: Yedekleme
    if (typeof gtag === 'function') {
        gtag('event', 'vault_exported', {
            'event_category': 'Kasa',
            'event_label': 'Kasa Yedeklendi'
        });
    }
    const encryptedData = localStorage.getItem(STORAGE_KEY);
    if (!encryptedData) {
        showCustomToast('Yedeklenecek veri bulunamadı.');
        return;
    }
    const blob = new Blob([encryptedData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hesapp-kasa-yedek-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
    showCustomToast('Yedekleme dosyası indiriliyor...');
}

function handleImport() {
    const fileInput = document.getElementById('importFileInput');
    fileInput.onchange = async e => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Modal notunu temizle
        modalNote.textContent = '';
        modalNote.classList.remove('error');
        
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            if (!data.salt || !data.iv || !data.ct) {
                throw new Error('Invalid file format');
            }
            
            const confirmed = await showConfirmation(`
                <span class="confirm-icon destructive" style="margin-top: 3px;">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clip-rule="evenodd" /></svg>
                </span>
                <div>
                    <strong>DİKKAT:</strong> Bu işlem, (varsa) mevcut kasanızdaki <strong>tüm notları kalıcı olarak silecek</strong> ve yedek dosyasındaki verilerle değiştirecektir.
                    <br><br>
                    <strong>Veri kaybı yaşamamak için:</strong> Eğer mevcut kasanızda önemli notlarınız varsa, bu işleme devam etmeden önce <strong>mevcut kasanızı yedeklediğinizden</strong> emin olun.
                    <br><br>Devam etmek istiyor musunuz?
                </div>`, 'Evet, Geri Yükle', 'Vazgeç');
            
            if (!confirmed) {
                // Kullanıcı vazgeçti, sadece dosya input'unu temizle
                fileInput.value = '';
                return;
            }
            
            // Yedek dosyasını localStorage'a kaydet
            try {
                localStorage.setItem(STORAGE_KEY, text);
                localStorage.setItem(TERMS_KEY, 'true');
                
                // Kaydın başarılı olduğunu doğrula
                const savedData = localStorage.getItem(STORAGE_KEY);
                if (savedData !== text) {
                    throw new Error('Storage error: Veri kaydedilemedi');
                }
            } catch (storageError) {
                throw new Error('Storage error: ' + storageError.message);
            }
            
            // Geri yükleme başarılı - localStorage'a kaydedildi
            // Bundan sonraki işlemler (modal kapatma, toast, vb.) başarısız olsa bile
            // geri yükleme başarılı sayılır
            
            // Önce tüm modal'ları ve confirmation dialog'ları kapat
            try {
                hideModal(); // Bu zaten confirmation backdrop'u da kapatıyor
            } catch (hideError) {
                console.warn('hideModal error:', hideError);
            }
            
            // Google Analytics event: Geri yükleme (hatası geri yüklemeyi engellemez)
            if (typeof gtag === 'function') {
                try {
                    gtag('event', 'vault_imported', {
                        'event_category': 'Kasa',
                        'event_label': 'Kasa Geri Yüklendi'
                    });
                } catch (gaError) {
                    console.warn('Google Analytics error:', gaError);
                }
            }
            
            // Başarı mesajı göster (hata olsa bile devam et)
            try {
                showCustomToast('Kasa başarıyla geri yüklendi!');
            } catch (toastError) {
                console.warn('showCustomToast error:', toastError);
            }
            
            // Geri yükleme sonrası giriş ekranını göster (kısa bir gecikme ile)
            // Bu işlem başarısız olsa bile geri yükleme başarılı sayılır
            setTimeout(() => {
                try {
                    // Önce tüm modal'ların kapalı olduğundan emin ol
                    hideModal(); // Bu zaten tüm modal'ları kapatıyor
                    // Sonra giriş ekranını aç
                    openVaultAccessMode();
                } catch (openError) {
                    console.warn('openVaultAccessMode error:', openError);
                }
            }, 300);
            
        } catch (err) {
            // Hata durumunda modal açık kalmalı ve hata mesajı gösterilmeli
            console.error('Import error:', err);
            
            // Confirmation backdrop'u kapat
            if (confirmBackdrop) {
                confirmBackdrop.style.display = 'none';
            }
            
            if (modalBackdrop.style.display === 'flex') {
                if (err.message === 'Invalid file format' || err.message.includes('Invalid file format')) {
                    modalNote.textContent = 'Hata: Geçersiz veya bozuk yedekleme dosyası. Lütfen geçerli bir Hesapp yedek dosyası seçin.';
                } else if (err.message.includes('Storage error')) {
                    modalNote.textContent = 'Hata: Depolama alanı dolu veya yedek dosyası kaydedilemedi. Lütfen depolama alanınızı kontrol edin.';
                } else {
                    modalNote.textContent = 'Hata: Yedek dosyası okunamadı veya kaydedilemedi. Lütfen tekrar deneyin.';
                }
                modalNote.classList.add('error');
            } else {
                // Modal kapalıysa toast göster
                if (err.message === 'Invalid file format' || err.message.includes('Invalid file format')) {
                    showCustomToast('Geçersiz yedek dosyası.');
                } else if (err.message.includes('Storage error')) {
                    showCustomToast('Depolama hatası. Lütfen depolama alanınızı kontrol edin.');
                } else {
                    showCustomToast('Geri yükleme başarısız oldu.');
                }
            }
        } finally {
            fileInput.value = '';
        }
    };
    fileInput.click();
}

// --- Info Modals (Terms, Security, etc.) ---
export function showTermsModal(isPreLogin = false) {
    termsBackdrop.style.display = 'flex';
    if (isPreLogin) {
        termsActions.style.display = 'flex'; // Ensure flex is active for two buttons
        termsActions.innerHTML = `
            <button class="link-like" id="cancelTermsBtn">Vazgeç</button>
            <button class="vault-btn" id="acceptTermsBtn">Kabul Ediyorum</button>`;
        document.getElementById('cancelTermsBtn').onclick = () => termsBackdrop.style.display = 'none';
        document.getElementById('acceptTermsBtn').onclick = () => {
            localStorage.setItem(TERMS_KEY, 'true');
            termsBackdrop.style.display = 'none';
            openVaultAccessMode();
        };
    } else {
        termsActions.style.display = 'block'; // Override flex for single button
        termsActions.innerHTML = `<button class="vault-btn" id="termsOK" style="width: 100%; text-align: center;">Anladım</button>`;
        document.getElementById('termsOK').onclick = () => termsBackdrop.style.display = 'none';
    }
}

export function showSecurityModal() { securityBackdrop.style.display = 'flex'; }
export function showAboutModal() { aboutBackdrop.style.display = 'flex'; }
export function showHowToUseModal() { howToUseBackdrop.style.display = 'flex'; }

function setupInfoModals() {
    // Modal backdrop'ları
    const settingsModalBackdrop = document.getElementById('settingsModalBackdrop');
    const infoModalBackdrop = document.getElementById('infoModalBackdrop');
    const settingsModalClose = document.getElementById('settingsModalClose');
    const infoModalClose = document.getElementById('infoModalClose');

    // Ayarlar butonu - Modal aç
    settingsBtn.onclick = (e) => {
        e.stopPropagation();
        settingsModalBackdrop.style.display = 'flex';
    };

    // Bilgi butonu - Modal aç
    infoBtn.onclick = (e) => {
        e.stopPropagation();
        infoModalBackdrop.style.display = 'flex';
    };

    // Modal kapatma
    settingsModalClose.onclick = () => { settingsModalBackdrop.style.display = 'none'; };
    infoModalClose.onclick = () => { infoModalBackdrop.style.display = 'none'; };

    // Backdrop'a tıklayınca kapat
    settingsModalBackdrop.onclick = (e) => {
        if (e.target === settingsModalBackdrop) {
            settingsModalBackdrop.style.display = 'none';
        }
    };
    infoModalBackdrop.onclick = (e) => {
        if (e.target === infoModalBackdrop) {
            infoModalBackdrop.style.display = 'none';
        }
    };

    // Ayarlar modal seçenekleri
    document.getElementById('settingsChangePassword').onclick = () => {
        settingsModalBackdrop.style.display = 'none';
        if (currentVaultPassword) {
            showChangePasswordModal(currentVaultPassword);
        } else {
            showCustomToast('Kasa açık değil. Lütfen önce kasayı açın.');
        }
    };
    document.getElementById('settingsTheme').onclick = () => {
        settingsModalBackdrop.style.display = 'none';
        showThemeModal();
    };
    document.getElementById('settingsAppearance').onclick = () => {
        settingsModalBackdrop.style.display = 'none';
        showAppearanceModal();
    };
    document.getElementById('settingsAutoLock').onclick = () => {
        settingsModalBackdrop.style.display = 'none';
        showAutoLockModal();
    };
    document.getElementById('settingsHoneyPassword').onclick = () => {
        settingsModalBackdrop.style.display = 'none';
        showHoneyPasswordModal();
    };
    document.getElementById('settingsExport').onclick = () => {
        settingsModalBackdrop.style.display = 'none';
        handleExport();
    };
    document.getElementById('settingsImport').onclick = () => {
        settingsModalBackdrop.style.display = 'none';
        handleImport();
    };
    document.getElementById('settingsDeleteVault').onclick = async () => {
        settingsModalBackdrop.style.display = 'none';
        const confirmed = await showConfirmation(`
            <span class="confirm-icon destructive" style="margin-top: 3px;">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M11.484 2.17a.75.75 0 0 1 1.032 0 11.209 11.209 0 0 0 7.877 3.08.75.75 0 0 1 .722.515 12.74 12.74 0 0 1 .635 3.985c0 5.942-4.064 10.933-9.563 12.348a.749.749 0 0 1-.374 0C6.314 20.683 2.25 15.692 2.25 9.75c0-1.39.223-2.73.635-3.985a.75.75 0 0 1 .722-.516l.143.001c2.996 0 5.718-1.17 7.734-3.08ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75ZM12 15a.75.75 0 0 0-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 0 0 .75-.75v-.008a.75.75 0 0 0-.75-.75H12Z" clip-rule="evenodd" /></svg>
            </span>
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
            localStorage.removeItem(TERMS_KEY);
            hideModal();
            currentVaultPassword = null;
            showCustomToast('Kasa başarıyla silindi!');
        }
    };

    // Bilgi modal seçenekleri
    document.getElementById('infoSecurity').onclick = () => {
        infoModalBackdrop.style.display = 'none';
        showSecurityModal();
    };
    document.getElementById('infoTerms').onclick = () => {
        infoModalBackdrop.style.display = 'none';
        showTermsModal(false);
    };
    document.getElementById('infoHowToUse').onclick = () => {
        infoModalBackdrop.style.display = 'none';
        showHowToUseModal();
    };
    const installAppOption = document.getElementById('infoInstallApp');
    if (installAppOption) {
        installAppOption.onclick = () => {
            infoModalBackdrop.style.display = 'none';
            // PWA install logic will be handled by pwa.js
            if (window.deferredPrompt) {
                window.deferredPrompt.prompt();
            }
        };
    }
    document.getElementById('infoAbout').onclick = () => {
        infoModalBackdrop.style.display = 'none';
        showAboutModal();
    };

    // Close buttons
    vaultCloseBtn.onclick = hideModal;
    securityClose.onclick = () => securityBackdrop.style.display = 'none';
    document.getElementById('securityOK').onclick = () => securityBackdrop.style.display = 'none';
    document.getElementById('termsCloseBtn').onclick = () => termsBackdrop.style.display = 'none';
    aboutClose.onclick = () => aboutBackdrop.style.display = 'none';
    howToUseClose.onclick = () => howToUseBackdrop.style.display = 'none';
    howToUseOK.onclick = () => howToUseBackdrop.style.display = 'none';
    
    // Sürüm numarasını doğrudan body etiketinden al ve ekrana yaz.
    const appVersion = document.body.dataset.version;
    if (appVersion) {
        document.querySelectorAll('.about-version').forEach(el => el.textContent = appVersion);
    }
}

// --- Appearance Modal ---
function showAppearanceModal() {
    const showWelcomeKey = 'hesapp_show_welcome_on_startup';
    const toggle = document.getElementById('showWelcomeToggle');
    
    // Mevcut ayarı oku ve toggle'ı ayarla. Label "gizle" diyor, bu yüzden mantık tersine çevrildi.
    // Eğer ayar 'false' ise (gizle aktif), toggle checked olmalı.
    const currentSetting = localStorage.getItem(showWelcomeKey);
    toggle.checked = currentSetting === 'false';

    appearanceModalBackdrop.style.display = 'flex';

    document.getElementById('appearanceSaveBtn').onclick = () => {
        // Toggle checked ise (gizle aktif), 'false' kaydet, değilse 'true' kaydet
        localStorage.setItem(showWelcomeKey, toggle.checked ? 'false' : 'true');
        appearanceModalBackdrop.style.display = 'none';
        showCustomToast('Görünüm ayarları kaydedildi.');
    };

    document.getElementById('appearanceCancelBtn').onclick = () => appearanceModalBackdrop.style.display = 'none';
}

// --- Settings Modals (Autolock, Change Password) ---
function showAutoLockModal() {
    const AUTOLOCK_KEY = 'hesapp_autolock_timeout_v1';
    const DEFAULT_AUTOLOCK_TIMEOUT = 3 * 60 * 1000;
    const getTimeout = () => {
        const saved = localStorage.getItem(AUTOLOCK_KEY);
        return saved === null ? DEFAULT_AUTOLOCK_TIMEOUT : (parseInt(saved, 10) === 0 ? Infinity : parseInt(saved, 10));
    };
    const currentTimeout = getTimeout();
    const durations = [
        { label: '1 Dakika', value: 60000 }, { label: '3 Dakika', value: 180000 },
        { label: '5 Dakika', value: 300000 }, { label: '10 Dakika', value: 600000 },
        { label: 'Asla', value: 0 }
    ];
    document.getElementById('autoLockOptions').innerHTML = durations.map(d => `
        <label class="radio-label">
            <input type="radio" name="autolock" value="${d.value}" ${((d.value === 0 && currentTimeout === Infinity) || d.value === currentTimeout) ? 'checked' : ''}>
            <span>${d.label}</span>
        </label>`).join('');
    autoLockModalBackdrop.style.display = 'flex';

    document.getElementById('autoLockSaveBtn').onclick = () => {
        const selectedValue = document.querySelector('input[name="autolock"]:checked').value;
        localStorage.setItem(AUTOLOCK_KEY, selectedValue);
        autoLockModalBackdrop.style.display = 'none';
        showCustomToast('Otomatik kilitleme süresi güncellendi.');
        resetInactivityTimer();
    };
    document.getElementById('autoLockCancelBtn').onclick = () => autoLockModalBackdrop.style.display = 'none';
    document.getElementById('autoLockCloseBtn').onclick = () => autoLockModalBackdrop.style.display = 'none';
}

function showThemeModal() {
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
    
    document.getElementById('themeOptions').innerHTML = themes.map(t => `
        <label class="radio-label">
            <div class="theme-option-content">
                <div class="theme-option-icon">${t.icon}</div>
                <span>${t.label}</span>
            </div>
            <input type="radio" name="theme" value="${t.value}" ${t.value === currentTheme ? 'checked' : ''}>
        </label>`).join('');
    themeModalBackdrop.style.display = 'flex';

    document.getElementById('themeModalSaveBtn').onclick = () => {
        const selectedTheme = document.querySelector('input[name="theme"]:checked').value;
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
        
        themeModalBackdrop.style.display = 'none';
        showCustomToast('Tema ayarı güncellendi.');
        
        if (typeof gtag === 'function') {
            gtag('event', 'theme_changed', { 'theme': selectedTheme });
        }
    };
    document.getElementById('themeModalCancelBtn').onclick = () => themeModalBackdrop.style.display = 'none';
    document.getElementById('themeModalClose').onclick = () => themeModalBackdrop.style.display = 'none';
}

function showChangePasswordModal(currentPassword) {
    document.getElementById('currentPass').value = '';
    document.getElementById('newPass1').value = '';
    document.getElementById('newPass2').value = '';
    const noteEl = document.getElementById('changePassNote');
    noteEl.textContent = '';
    noteEl.classList.remove('error');
    changePasswordBackdrop.style.display = 'flex';

    document.getElementById('changePassSaveBtn').onclick = async () => {
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
            noteEl.textContent = 'Yeni şifreler eşleşmiyor.';
            noteEl.classList.add('error');
            return;
        }

        try {
            const plainJson = await decryptMessage(currentPass, JSON.parse(localStorage.getItem(STORAGE_KEY)));
            const newEncryptedPayload = await encryptMessage(newPass1, plainJson);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newEncryptedPayload));
            if (typeof gtag === 'function') gtag('event', 'feature_used', { 'feature_name': 'change_password' });
            changePasswordBackdrop.style.display = 'none';
            showCustomToast('Parola başarıyla değiştirildi!');
            hideModal();
        } catch (e) {
            noteEl.textContent = 'Bir hata oluştu. Mevcut parola hatalı olabilir.';
            noteEl.classList.add('error');
        }
    };
    document.getElementById('changePassCancelBtn').onclick = () => changePasswordBackdrop.style.display = 'none';
}

function showHoneyPasswordModal() {
    const honeyPass1 = document.getElementById('honeyPass1');
    const honeyPass2 = document.getElementById('honeyPass2');
    const honeyPassNote = document.getElementById('honeyPassNote');
    const honeyPassStatus = document.getElementById('honeyPassStatus');
    
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
    
    if (existingHoneyPasswordData) {
        try {
            const parsed = JSON.parse(existingHoneyPasswordData);
            if (parsed.salt && parsed.hash) {
                // Yeni format (hash)
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
            honeyPassStatus.textContent = 'Sahte şifre belirlenmemiş';
            honeyPassStatus.style.background = 'var(--key-bg)';
            honeyPassStatus.style.color = 'var(--muted)';
            document.getElementById('honeyPassDeleteBtn').style.display = 'none';
        }
    } else {
        honeyPassStatus.textContent = 'Sahte şifre belirlenmemiş';
        honeyPassStatus.style.background = 'var(--key-bg)';
        honeyPassStatus.style.color = 'var(--muted)';
        document.getElementById('honeyPassDeleteBtn').style.display = 'none';
    }
    
    honeyPass1.value = '';
    honeyPass2.value = '';
    honeyPassNote.textContent = '';
    honeyPassNote.classList.remove('error');
    honeyPasswordBackdrop.style.display = 'flex';
    
    document.getElementById('honeyPassSaveBtn').onclick = async () => {
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
            honeyPasswordBackdrop.style.display = 'none';
            showCustomToast('Sahte parola başarıyla ayarlandı!');
        } catch (e) {
            honeyPassNote.textContent = 'Bir hata oluştu. Lütfen tekrar deneyin.';
            honeyPassNote.classList.add('error');
        }
    };
    
    document.getElementById('honeyPassDeleteBtn').onclick = async () => {
        const confirmed = await showConfirmation(`
            <span class="confirm-icon destructive" style="margin-top: 3px;">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M11.484 2.17a.75.75 0 0 1 1.032 0 11.209 11.209 0 0 0 7.877 3.08.75.75 0 0 1 .722.515 12.74 12.74 0 0 1 .635 3.985c0 5.942-4.064 10.933-9.563 12.348a.749.749 0 0 1-.374 0C6.314 20.683 2.25 15.692 2.25 9.75c0-1.39.223-2.73.635-3.985a.75.75 0 0 1 .722-.516l.143.001c2.996 0 5.718-1.17 7.734-3.08ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75ZM12 15a.75.75 0 0 0-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 0 0 .75-.75v-.008a.75.75 0 0 0-.75-.75H12Z" clip-rule="evenodd" /></svg>
            </span>
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
            honeyPasswordBackdrop.style.display = 'none';
            showCustomToast('Sahte parola silindi!');
        }
    };
    
    document.getElementById('honeyPassCancelBtn').onclick = () => {
        honeyPasswordBackdrop.style.display = 'none';
    };
    document.getElementById('honeyPassCloseBtn').onclick = () => {
        honeyPasswordBackdrop.style.display = 'none';
    };
}

// --- Utils ---
function formatVaultDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}.${month}.${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

// --- Initializer ---
export function initVaultUI() { setupInfoModals(); }