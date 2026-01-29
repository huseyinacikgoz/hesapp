import {
    modalTitle, modalNote, modalContent, modalOK, modalCancel, leftActions, vaultBackBtn,
    escapeHtml, formatVaultDate, saveVaultData, isTrashBinEnabled
} from './utils.js';

import { showModal, showConfirmation } from './modal-manager.js';
import { showVaultManagementScreen } from './vault-list.js';
import { showCustomToast } from '../../toast.js';

export function showMessageEditor(password, messages, index) {
    const isNew = index === -1;
    const msg = isNew ? { title: '', content: '', date: new Date().toISOString(), creationDate: new Date().toISOString(), isImportant: false, isDeleted: false } : { ...messages[index] };
    // Eski notlar için varsayılanlar
    if (msg.isImportant === undefined) msg.isImportant = false;
    if (msg.isDeleted === undefined) msg.isDeleted = false;
    let isCurrentlyEditing = isNew;

    function updateEditorUI() {
        const isEditing = isCurrentlyEditing;
        if (modalTitle) modalTitle.textContent = isNew ? "Yeni Not Ekle" : (isEditing ? "Notu Düzenle" : "Not");

        showModal(
            `<div class="field"><label>Başlık:</label><input id="msgTitle" type="text" value="${escapeHtml(msg.title)}" placeholder="Not Başlığı (Opsiyonel)" ${!isEditing ? 'readonly' : ''}></div>
             <div class="field">
                 <label>İçerik:</label>
                 <div class="copy-container">
                     <textarea id="msgContent" rows="7" placeholder="Gizli notunuzun içeriği" ${!isEditing ? 'readonly' : ''}>${escapeHtml(msg.content)}</textarea>
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

        if (vaultBackBtn) {
            vaultBackBtn.onclick = () => showVaultManagementScreen(password, messages);
            vaultBackBtn.style.display = isEditing ? 'none' : 'flex';
        }

        if (leftActions) leftActions.innerHTML = '';
        if (modalCancel) modalCancel.style.display = 'none';

        if (isNew) {
            if (modalOK) {
                modalOK.textContent = 'Kaydet';
                modalOK.onclick = () => handleSaveMessage(password, messages, index);
            }
            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'action-toggle-btn';
            cancelBtn.textContent = 'Vazgeç';
            cancelBtn.onclick = () => showVaultManagementScreen(password, messages);
            if (leftActions) leftActions.appendChild(cancelBtn);
        } else if (isEditing) {
            if (modalOK) {
                modalOK.textContent = 'Güncelle';
                modalOK.onclick = () => handleSaveMessage(password, messages, index);
            }
            const cancelEditBtn = document.createElement('button');
            cancelEditBtn.className = 'action-toggle-btn';
            cancelEditBtn.textContent = 'Vazgeç';
            cancelEditBtn.onclick = () => {
                isCurrentlyEditing = false;
                updateEditorUI();
            };
            if (leftActions) leftActions.appendChild(cancelEditBtn);
        } else { // View mode
            // Çöp kutusundaki notlar için farklı butonlar
            if (msg.isDeleted) {
                if (modalOK) {
                    modalOK.textContent = 'Geri Yükle';
                    modalOK.onclick = () => handleRestoreMessage(password, messages, index);
                }

                const deleteNoteBtn = document.createElement('button');
                deleteNoteBtn.className = 'delete-btn';
                deleteNoteBtn.textContent = 'Kalıcı Sil';
                deleteNoteBtn.onclick = () => handleDeleteMessage(password, messages, index);
                if (leftActions) leftActions.appendChild(deleteNoteBtn);
            } else {
                if (modalOK) {
                    modalOK.textContent = 'Düzenle';
                    modalOK.onclick = () => {
                        isCurrentlyEditing = true;
                        updateEditorUI();
                    };
                }
                const deleteNoteBtn = document.createElement('button');
                deleteNoteBtn.className = 'delete-btn';
                const trashEnabled = isTrashBinEnabled();
                deleteNoteBtn.textContent = trashEnabled ? 'Çöp Kutusuna Taşı' : 'Notu Sil';
                deleteNoteBtn.onclick = () => handleDeleteMessage(password, messages, index);
                if (leftActions) leftActions.appendChild(deleteNoteBtn);
            }

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
    }

    if (isCurrentlyEditing) {
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
        // Not: updateEditorUI lokal fonksiyon olduğu için override edilebilir.
        const originalUpdateEditorUI = updateEditorUI;
        updateEditorUI = function () {
            if (!isCurrentlyEditing) {
                document.removeEventListener('keydown', handleEditorShortcuts);
            }
            originalUpdateEditorUI();
        };
    }

    updateEditorUI();
}

export async function handleSaveMessage(password, messages, index) {
    const titleInput = document.getElementById('msgTitle');
    const contentInput = document.getElementById('msgContent');
    const importantInput = document.getElementById('msgImportant');

    const title = titleInput ? titleInput.value.trim() : '';
    const content = contentInput ? contentInput.value.trim() : '';
    const isImportant = importantInput ? importantInput.checked : false;

    if (content === '') {
        if (modalNote) {
            modalNote.textContent = 'Mesaj içeriği boş olamaz!';
            modalNote.classList.add('error');
        }
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
        isImportant: isImportant,
        isDeleted: false
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

    const success = await saveVaultData(password, messages);
    if (success) {
        showVaultManagementScreen(password, messages);
    } else {
        if (modalNote) {
            modalNote.innerHTML = 'Hata: Depolama alanına yazılamadı.';
            modalNote.classList.add('error');
        }
    }
}

export async function handleDeleteMessage(password, messages, index) {
    const msg = messages[index];
    const trashEnabled = isTrashBinEnabled();

    // Eğer not zaten çöp kutusundaysa veya çöp kutusu kapalıysa -> kalıcı sil
    if (msg.isDeleted || !trashEnabled) {
        const confirmed = await showConfirmation("<div>Bu notu kalıcı olarak silmek istediğinizden emin misiniz?</div><div style='margin-top:8px;'><small style='color:var(--muted); font-size:14px;'>Bu işlem geri alınamaz.</small></div>");
        if (confirmed) {
            messages.splice(index, 1);
            if (typeof gtag === 'function') {
                gtag('event', 'note_permanently_deleted', {
                    'event_category': 'Kasa',
                    'event_label': 'Not Kalıcı Silindi'
                });
            }

            const success = await saveVaultData(password, messages);
            if (success) {
                showCustomToast('Not kalıcı olarak silindi');
                showVaultManagementScreen(password, messages);
            } else {
                if (modalNote) {
                    modalNote.textContent = 'Hata: Silme sonrası kayıt başarısız oldu.';
                    modalNote.classList.add('error');
                }
                showCustomToast('Not silinemedi. Lütfen tekrar deneyin.');
            }
        }
    } else {
        // Çöp kutusuna taşı
        const confirmed = await showConfirmation("<div>Bu notu çöp kutusuna taşımak istediğinizden emin misiniz?</div><div style='margin-top:8px;'><small style='color:var(--muted); font-size:14px;'>Çöp kutusundan geri yükleyebilirsiniz.</small></div>", "Çöp Kutusuna Taşı", "İptal");
        if (confirmed) {
            messages[index].isDeleted = true;
            messages[index].deletedDate = new Date().toISOString();
            if (typeof gtag === 'function') {
                gtag('event', 'note_moved_to_trash', {
                    'event_category': 'Kasa',
                    'event_label': 'Not Çöp Kutusuna Taşındı'
                });
            }

            const success = await saveVaultData(password, messages);
            if (success) {
                showCustomToast('Not çöp kutusuna taşındı');
                showVaultManagementScreen(password, messages);
            } else {
                if (modalNote) {
                    modalNote.textContent = 'Hata: Çöp kutusuna taşıma başarısız oldu.';
                    modalNote.classList.add('error');
                }
                showCustomToast('Not taşınamadı. Lütfen tekrar deneyin.');
            }
        }
    }
}

export async function handleRestoreMessage(password, messages, index) {
    const confirmed = await showConfirmation("<div>Bu notu geri yüklemek istediğinizden emin misiniz?</div><div style='margin-top:8px;'><small style='color:var(--muted); font-size:14px;'>Not, ana listeye geri taşınacak.</small></div>", "Geri Yükle", "İptal");
    if (confirmed) {
        messages[index].isDeleted = false;
        delete messages[index].deletedDate;
        if (typeof gtag === 'function') {
            gtag('event', 'note_restored', {
                'event_category': 'Kasa',
                'event_label': 'Not Geri Yüklendi'
            });
        }

        const success = await saveVaultData(password, messages);
        if (success) {
            showCustomToast('Not geri yüklendi');
            showVaultManagementScreen(password, messages);
        } else {
            if (modalNote) {
                modalNote.textContent = 'Hata: Geri yükleme başarısız oldu.';
                modalNote.classList.add('error');
            }
            showCustomToast('Not geri yüklenemedi. Lütfen tekrar deneyin.');
        }
    }
}
