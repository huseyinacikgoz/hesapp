import {
    currentVaultPassword, currentFilter, setCurrentFilter,
    modalTitle, modalNote, modalContent, modalOK, modalBackdrop,
    escapeHtml, formatVaultDate, NO_SEARCH_SVG, EMPTY_STATE_SVG,
    isTrashBinEnabled, STORAGE_KEY, TERMS_KEY, HOW_TO_USE_ON_FIRST_LOGIN_KEY,
    saveVaultData, vaultCloseBtn
} from './utils.js';

import { showModal, hideModal, showConfirmation } from './modal-manager.js';
import { showMessageEditor, handleDeleteMessage } from './message-editor.js';
import { showCustomToast } from '../../toast.js';
import { resetInactivityTimer } from '../vault.js';

// --- Vault Management Screen ---

export function showVaultManagementScreen(password, messages) {
    // currentVaultPassword = password; // Bu utils.js'de güncellenmeli ama burada sadece local değişken mi?
    // Hayır, utils.js'deki setter'ı kullanmalıyız.
    // Ancak currentVaultPassword utils.js'den import edildi, read-only binding.
    // utils.js'de setCurrentVaultPassword var mı? Evet ekledim.
    // Ama orijinal kodda global değişkendi.
    // Burada password parametresi var.

    // Filtre durumunu doğrula
    if (!currentFilter) setCurrentFilter('all');
    // Eğer çöp kutusu kapalıysa ve filtre çöp kutusuysa, tümüne dön
    if (currentFilter === 'trash' && !isTrashBinEnabled()) {
        setCurrentFilter('all');
    }

    if (modalTitle) modalTitle.textContent = "Kasa Yönetimi";
    if (modalNote) {
        modalNote.textContent = ''; // Hata mesajlarını temizle
        modalNote.classList.remove('error');
    }
    showModal('', '', false, true, true, false);
    resetInactivityTimer();

    if (modalContent) {
        modalContent.innerHTML = `
            ${messages.length > 0 ? `
            <div class="search-field">
                <span class="search-icon"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg></span>
                <input type="text" id="noteSearchInput" placeholder="Notlarda ara..." autocomplete="off">
            </div>
            <div class="note-filter-buttons" style="display:flex; justify-content:center; gap:8px; margin-bottom:12px; margin-top:8px;">
                <button class="filter-btn ${currentFilter === 'all' ? 'active' : ''}" data-filter="all">Tümü</button>
                <button class="filter-btn filter-important ${currentFilter === 'important' ? 'active' : ''}" data-filter="important">Favoriler</button>
                <button class="filter-btn filter-trash ${currentFilter === 'trash' ? 'active' : ''}" id="trashFilterBtn" data-filter="trash" style="display:${isTrashBinEnabled() ? 'flex' : 'none'};">Çöp Kutusu</button>
            </div>` : ''}
            <div id="messageList" style="margin-bottom: 15px;"></div>
        `;
    }

    const messageListContainer = document.getElementById('messageList');
    const searchInput = document.getElementById('noteSearchInput');

    function renderMessageList(messagesToRender) {
        // Filtreleme uygula
        let filteredMessages = messagesToRender;
        if (currentFilter === 'important') {
            // Favoriler: silinmemiş ve favori olanlar
            filteredMessages = messagesToRender.filter(msg => !msg.isDeleted && msg.isImportant === true);
        } else if (currentFilter === 'trash') {
            // Çöp Kutusu: silinmiş notlar
            filteredMessages = messagesToRender.filter(msg => msg.isDeleted === true);
        } else {
            // Tümü: sadece silinmemiş notlar
            filteredMessages = messagesToRender.filter(msg => !msg.isDeleted);
        }
        // Sıralama: "Tümü" sekmesinde sadece tarihe göre, "Favoriler" sekmesinde favoriler önce
        const sortedMessages = [...filteredMessages].sort((a, b) => {
            // Eğer "Favoriler" filtresindeyse, favorileri önce göster
            if (currentFilter === 'important') {
                const aImportant = a.isImportant ? 1 : 0;
                const bImportant = b.isImportant ? 1 : 0;
                if (aImportant !== bImportant) return bImportant - aImportant;
            }
            // Her durumda tarihe göre sırala (en yeni önce)
            return new Date(b.date) - new Date(a.date);
        })

        // EMPTY STATE LOGIC
        if (sortedMessages.length === 0) {
            const isSearch = searchInput && searchInput.value;
            let svg, text, subtext;

            if (isSearch) {
                svg = NO_SEARCH_SVG;
                text = 'Aramanızla eşleşen not bulunamadı.';
                subtext = 'Farklı anahtar kelimeler deneyin.';
            } else if (currentFilter === 'important') {
                svg = `<svg class="empty-state-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"><path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg>`;
                text = 'Henüz favori not eklenmedi.';
                subtext = ''; // 'Bir notu düzenlerken "Favorilere ekle" seçeneğini işaretleyin.';
            } else if (currentFilter === 'trash') {
                svg = `<svg class="empty-state-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>`;
                text = 'Çöp kutusu boş.';
                subtext = ''; // 'Silinen notlar burada görünür ve geri yüklenebilir.';
            } else {
                svg = EMPTY_STATE_SVG;
                text = 'Henüz bir not eklenmedi.';
                subtext = 'Yeni bir not oluşturmak için "+" butonuna basın.';
            }

            if (messageListContainer) {
                messageListContainer.innerHTML = `
                    <div class="empty-state-container">
                        ${svg}
                        <div class="empty-state-text">${text}</div>
                        <div class="empty-state-subtext">${subtext}</div>
                    </div>
                `;
            }
            return;
        }

        if (messageListContainer) {
            messageListContainer.innerHTML = sortedMessages.map((msg, index) => {
                const originalIndex = messages.indexOf(msg);
                return `
                <div class="message-item view-btn" data-index="${originalIndex}" style="animation-delay: ${index * 0.05}s;">
                    <div class="swipe-actions">
                        <button class="swipe-action swipe-favorite" data-action="favorite">
                            <span class="material-symbols-outlined">star</span>
                        </button>
                        <button class="swipe-action swipe-delete" data-action="delete">
                            <span class="material-symbols-outlined">delete</span>
                        </button>
                    </div>
                    <div class="message-item-content">
                        <div style="display:flex; align-items:center; gap:8px; max-width: 60%; flex:1;">
                            <span class="view-title" style="font-weight:600; color:var(--accent); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(msg.title || 'Başlıksız Not')}</span>
                        </div>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <div style="width:18px; height:18px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                                ${msg.isImportant ? `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" style="width:18px; height:18px; color:#ff9500;"><path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg>` : ''}
                            </div>
                            <span class="message-date" style="font-size:12px; color:var(--muted); white-space:nowrap;">${escapeHtml(formatVaultDate(msg.date))}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:16px; height:16px; color:var(--muted);"><path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
                        </div>
                    </div>
                </div>`;
            }).join('');

            messageListContainer.querySelectorAll('.message-item').forEach(item => {
                const originalIndex = parseInt(item.dataset.index);
                // Setup Swipe
                setupSwipe(item, password, messages, originalIndex);

                // Click listener on content
                const content = item.querySelector('.message-item-content');
                content.onclick = (e) => {
                    // Eğer swipe aktifse, önce kapat
                    if (item.classList.contains('swiped-left') || item.classList.contains('swiped-right')) {
                        content.style.transition = 'transform 0.3s ease';
                        content.style.transform = 'translateX(0)';
                        item.classList.remove('swiped-left', 'swiped-right');
                        // Transition bitene kadar işaretle
                        item.dataset.closing = 'true';
                        setTimeout(() => {
                            delete item.dataset.closing;
                        }, 300);
                        return; // Not editörünü açma
                    }

                    // Kapanma animasyonu sırasında veya swiping yapılıyorsa, not editörünü açma
                    if (item.dataset.swiping || item.dataset.closing) {
                        return;
                    }

                    // Swipe yoksa, not editörünü aç
                    showMessageEditor(password, messages, originalIndex);
                };
            });
        }
    }

    // Filtre butonları
    const filterButtons = document.querySelectorAll('.filter-btn');
    if (filterButtons.length > 0) {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => {
                    b.classList.remove('active');
                });
                btn.classList.add('active');

                setCurrentFilter(btn.dataset.filter);
                if (searchInput && searchInput.value) {
                    const searchTerm = searchInput.value.toLowerCase();
                    let filtered = messages.filter(msg =>
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
            let filtered = messages.filter(msg =>
                (msg.title && msg.title.toLowerCase().includes(searchTerm)) ||
                (msg.content && msg.content.toLowerCase().includes(searchTerm))
            );
            renderMessageList(filtered);
        });
    }

    renderMessageList(messages);

    // Buton metnini ve işlevini ayarla
    if (modalOK) {
        modalOK.style.display = 'inline-block'; // Show default footer button
        modalOK.textContent = 'Yeni Not Ekle';
        modalOK.onclick = () => showMessageEditor(password, messages, -1);
    }

    // Remove existing FAB if any
    const modal = document.querySelector('#modalBackdrop .modal');
    if (modal) {
        const existingFab = modal.querySelector('.fab-btn');
        if (existingFab) existingFab.remove();
    }

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
    // Not: hideModal import edildiği için override edilemez.
    // Bu yüzden event listener'ı kaldırmak için başka bir yol bulmalıyız.
    // Şimdilik, modal kapandığında bu listener'ın çalışmaması için bir kontrol ekleyebiliriz
    // veya modal-manager'a bir callback ekleyebiliriz.
    // Ancak en kolayı, modalBackdrop display none ise çalışmamasını sağlamak.
    // Fakat memory leak olmaması için removeEventListener yapmak en iyisi.
    // Çözüm: hideModal'ı override edemeyiz ama modalBackdrop.onclick içinde hideModal çağrılıyor.
    // Bizim kendi cleanup fonksiyonumuz olmalı.
    // Şimdilik basitçe:
    const originalOnclick = modalBackdrop.onclick;
    modalBackdrop.onclick = (e) => {
        if (e.target === modalBackdrop) {
            document.removeEventListener('keydown', handleVaultShortcuts);
        }
        if (originalOnclick) originalOnclick(e);
    };

    // Ayrıca vaultCloseBtn için de
    if (vaultCloseBtn) {
        vaultCloseBtn.onclick = (e) => {
            e.stopPropagation(); // Event bubbling'i engelle
            console.log('Vault close button clicked');
            document.removeEventListener('keydown', handleVaultShortcuts);
            hideModal();
        };
    }
}

export async function toggleFavorite(password, messages, index) {
    messages[index].isImportant = !messages[index].isImportant;
    const success = await saveVaultData(password, messages);
    if (success) {
        showVaultManagementScreen(password, messages);
    } else {
        showCustomToast('Hata: Favori durumu güncellenemedi.');
    }
}

export function setupSwipe(element, password, messages, index) {
    let startX = 0;
    let currentX = 0;
    let isSwiping = false;
    const swipeThreshold = 50; // Minimum distance to trigger action

    const content = element.querySelector('.message-item-content');
    const favoriteBtn = element.querySelector('[data-action="favorite"]');
    const deleteBtn = element.querySelector('[data-action="delete"]');

    // Button click handlers
    if (favoriteBtn) {
        favoriteBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            await toggleFavorite(password, messages, index);
            closeSwipe();
        });
    }

    if (deleteBtn) {
        deleteBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            await handleDeleteMessage(password, messages, index);
            closeSwipe();
        });
    }

    function closeSwipe() {
        content.style.transform = 'translateX(0)';
        element.classList.remove('swiped-left', 'swiped-right');
    }

    element.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        currentX = startX;
        isSwiping = false;
        content.style.transition = 'none';
    }, { passive: true });

    element.addEventListener('touchmove', (e) => {
        currentX = e.touches[0].clientX;
        const diff = currentX - startX;

        if (Math.abs(diff) > 5) {
            isSwiping = true;
            element.dataset.swiping = 'true';

            // Show swipe actions while swiping
            const swipeActions = element.querySelector('.swipe-actions');
            if (swipeActions) swipeActions.style.opacity = '1';

            // Limit swipe distance
            let translateX = diff;
            const maxSwipe = 100;
            if (translateX > maxSwipe) translateX = maxSwipe;
            if (translateX < -maxSwipe) translateX = -maxSwipe;

            content.style.transform = `translateX(${translateX}px)`;
        }
    }, { passive: true });

    element.addEventListener('touchend', () => {
        const diff = currentX - startX;
        content.style.transition = 'transform 0.3s ease';

        if (Math.abs(diff) > swipeThreshold && isSwiping) {
            if (diff > 0) {
                // Swipe right - show favorite
                content.style.transform = 'translateX(80px)';
                element.classList.add('swiped-right');
                element.classList.remove('swiped-left');
            } else {
                // Swipe left - show delete
                content.style.transform = 'translateX(-80px)';
                element.classList.add('swiped-left');
                element.classList.remove('swiped-right');
            }
        } else {
            closeSwipe();
        }

        setTimeout(() => {
            delete element.dataset.swiping;
        }, 300);
    });
}

export function handleExport() {
    if (typeof gtag === 'function') {
        gtag('event', 'vault_backup', {
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
    // Tarih ve saat formatı: YYYY-MM-DD-HH-MM-SS
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timestamp = `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;
    a.download = `hesapp-kasa-yedek-${timestamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
    showCustomToast('Yedekleme dosyası indiriliyor...');
}

export function handleImport() {
    const fileInput = document.getElementById('importFileInput');
    if (!fileInput) return;

    fileInput.onchange = async e => {
        const file = e.target.files[0];
        if (!file) return;

        // Modal notunu temizle
        if (modalNote) {
            modalNote.textContent = '';
            modalNote.classList.remove('error');
        }

        try {
            const text = await file.text();
            const data = JSON.parse(text);
            if (!data.salt || !data.iv || !data.ct) {
                throw new Error('Invalid file format');
            }

            const confirmed = await showConfirmation(`
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
                // YENİ EKLENDİ: Geri yükleme sonrası ilk girişte yardım gösterilmesi için işaret bırak.
                localStorage.setItem(HOW_TO_USE_ON_FIRST_LOGIN_KEY, 'true');
                // YENİ İSTEK: Başlangıçta karşılama ekranını gizle ayarını aktif et.
                localStorage.setItem('hesapp_show_welcome_on_startup', 'false');

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
                gtag('event', 'vault_restore', {
                    'event_category': 'Kasa',
                    'event_label': 'Kasa Geri Yüklendi'
                });
            }

            showCustomToast('Kasa yedeği başarıyla geri yüklendi!');

            // Sayfayı yenile (en temiz yöntem)
            setTimeout(() => {
                window.location.reload();
            }, 1500);

        } catch (error) {
            console.error('Import error:', error);
            if (modalNote) {
                modalNote.textContent = 'Hata: Geçersiz yedek dosyası veya okuma hatası.';
                modalNote.classList.add('error');
            }
            fileInput.value = ''; // Hata durumunda input'u temizle
        }
    };
    fileInput.click();
}
