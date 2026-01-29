import {
    confirmBackdrop, confirmMessage, confirmOK, confirmCancel,
    modalContent, modalNote, modalBackdrop, infoBtn, settingsBtn, vaultBackBtn,
    modalOK, modalCancel, leftActions,
    securityBackdrop, termsBackdrop, aboutBackdrop, howToUseBackdrop,
    autoLockModalBackdrop, honeyPasswordBackdrop, changePasswordBackdrop,
    appearanceModalBackdrop, themeModalBackdrop,
    backdropClickTimeout, setBackdropClickTimeout,
    confirmationResolver, setConfirmationResolver,
    vaultCloseBtn
} from './utils.js';

// --- Confirmation Modal ---

export function showConfirmation(message, okText = 'Evet, Sil', cancelText = 'İptal') {
    const warningIcon = `
        <div style="display: flex; justify-content: center; margin-bottom: 15px;">
            <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(220, 53, 69, 0.1); display: flex; align-items: center; justify-content: center; color: #dc3545;">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 28px; height: 28px;">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
            </div>
        </div>
    `;
    confirmMessage.innerHTML = warningIcon + message;
    confirmOK.textContent = okText;
    confirmCancel.textContent = cancelText;
    confirmOK.className = okText.includes('Sil') || okText.includes('Yükle') || okText.includes('Taşı') ? 'delete-btn' : 'vault-btn';
    confirmBackdrop.style.display = 'flex';
    return new Promise(resolve => {
        setConfirmationResolver(resolve);
    });
}

// Event Listeners for Confirmation Modal
if (confirmOK) {
    confirmOK.onclick = () => {
        confirmBackdrop.style.display = 'none';
        if (confirmationResolver) confirmationResolver(true);
    };
}

if (confirmCancel) {
    confirmCancel.onclick = () => {
        confirmBackdrop.style.display = 'none';
        if (confirmationResolver) confirmationResolver(false);
    };
}

// Backdrop'a tıklayınca onay modal'ını kapat (iptal olarak)
if (confirmBackdrop) {
    confirmBackdrop.onclick = (e) => {
        if (e.target === confirmBackdrop) {
            confirmBackdrop.style.display = 'none';
            if (confirmationResolver) confirmationResolver(false);
        }
    };

    // Modal içeriğine tıklandığında event'in backdrop'a gitmesini engelle
    const confirmModalElement = confirmBackdrop.querySelector('.modal');
    if (confirmModalElement) {
        confirmModalElement.onclick = (e) => {
            e.stopPropagation();
        };
    }
}

// --- Main Modal Logic ---

export function showModal(html, note = '', isError = false, showInfo = false, showSettings = false, showBack = false, disableBackdropCloseForSeconds = 0) {
    modalContent.innerHTML = html;
    modalNote.innerHTML = note;
    modalNote.classList.toggle('error', isError);

    // Eski timeout'u temizle (eğer varsa)
    if (backdropClickTimeout) {
        clearTimeout(backdropClickTimeout);
        setBackdropClickTimeout(null);
    }

    modalBackdrop.style.display = 'flex';
    modalBackdrop.setAttribute('aria-hidden', 'false');
    const openTime = Date.now();

    // Backdrop'a tıklayınca modal'ı kapat (modal içeriğine tıklandığında kapanmasın)
    modalBackdrop.onclick = (e) => {
        if (e.target === modalBackdrop) {
            if (disableBackdropCloseForSeconds > 0) {
                const elapsed = (Date.now() - openTime) / 1000;
                if (elapsed < disableBackdropCloseForSeconds) return;
            }
            hideModal();
            modalBackdrop.style.display = 'none';
            delete modalBackdrop.dataset.wasOpen;
        }
    };

    // Modal içeriğine tıklandığında event'in backdrop'a gitmesini engelle
    const modalElement = modalBackdrop.querySelector('.modal');
    if (modalElement) {
        modalElement.onclick = (e) => {
            e.stopPropagation();
        };
    }

    // Yeni modal butonlarını göster/gizle
    if (infoBtn) infoBtn.style.display = showInfo ? 'flex' : 'none';
    if (settingsBtn) settingsBtn.style.display = showSettings ? 'flex' : 'none';
    if (vaultBackBtn) vaultBackBtn.style.display = showBack ? 'flex' : 'none';

    if (modalOK) modalOK.style.display = 'inline-block';
    if (modalCancel) modalCancel.style.display = 'none';
    if (leftActions) leftActions.innerHTML = '';

    setTimeout(() => {
        const firstInput = modalBackdrop.querySelector('input, textarea');
        if (firstInput) firstInput.focus();
        modalBackdrop.querySelectorAll('input[type="password"], input[type="text"]').forEach(input => {
            input.addEventListener('keydown', modalInputKeyHandler);
        });
    }, 40);

    // Default close button handler
    if (vaultCloseBtn) {
        vaultCloseBtn.style.zIndex = '1000'; // Ensure it's on top
        vaultCloseBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Default vault close button clicked');
            hideModal();
        };
    }
}

export function hideModal() {
    // Backdrop click timeout'u temizle
    if (backdropClickTimeout) {
        clearTimeout(backdropClickTimeout);
        setBackdropClickTimeout(null);
    }

    // Tüm modal'ları gizle
    if (modalBackdrop) {
        modalBackdrop.style.display = 'none';
        modalBackdrop.setAttribute('aria-hidden', 'true');
    }
    if (securityBackdrop) securityBackdrop.style.display = 'none';
    if (termsBackdrop) termsBackdrop.style.display = 'none';
    if (aboutBackdrop) aboutBackdrop.style.display = 'none';
    if (howToUseBackdrop) howToUseBackdrop.style.display = 'none';
    if (autoLockModalBackdrop) autoLockModalBackdrop.style.display = 'none';
    if (honeyPasswordBackdrop) honeyPasswordBackdrop.style.display = 'none';
    if (changePasswordBackdrop) changePasswordBackdrop.style.display = 'none';
    if (appearanceModalBackdrop) appearanceModalBackdrop.style.display = 'none';
    if (themeModalBackdrop) themeModalBackdrop.style.display = 'none';

    const settingsModalBackdrop = document.getElementById('settingsModalBackdrop');
    if (settingsModalBackdrop) settingsModalBackdrop.style.display = 'none';

    const infoModalBackdrop = document.getElementById('infoModalBackdrop');
    if (infoModalBackdrop) infoModalBackdrop.style.display = 'none';

    if (confirmBackdrop) confirmBackdrop.style.display = 'none';

    if (modalBackdrop) {
        modalBackdrop.querySelectorAll('input[type="password"], input[type="text"]').forEach(input => {
            input.removeEventListener('keydown', modalInputKeyHandler);
        });
    }
}

export function modalInputKeyHandler(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        if (modalOK.onclick && typeof modalOK.onclick === 'function') {
            modalOK.onclick();
        }
    }
}
