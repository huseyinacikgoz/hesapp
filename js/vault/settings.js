/**
 * @module settings
 * @description Manages the settings and info modals, including their interaction with the main vault modal.
 * 
 * @deprecated Bu modül artık kullanılmamaktadır. 
 * Tüm işlevsellik settings-modals.js'e taşınmıştır.
 * Bu dosya geriye dönük uyumluluk için tutulmaktadır.
 */

/**
 * Initializes the event listeners for settings and info modals.
 */
export function initSettings() {
    // Main vault modal elements
    const modalBackdrop = document.getElementById('modalBackdrop');
    const settingsBtn = document.getElementById('settingsBtn');
    const infoBtn = document.getElementById('infoBtn');

    // Settings modal elements
    const settingsModalBackdrop = document.getElementById('settingsModalBackdrop');
    const settingsModalClose = document.getElementById('settingsModalClose');

    // Info modal elements
    const infoModalBackdrop = document.getElementById('infoModalBackdrop');
    const infoModalClose = document.getElementById('infoModalClose');

    /**
     * Hides the main vault modal and shows a sub-modal.
     * @param {HTMLElement} subModalBackdrop The backdrop of the sub-modal to show.
     */
    const openSubModal = (subModalBackdrop) => {
        modalBackdrop.setAttribute('aria-hidden', 'true');
        subModalBackdrop.removeAttribute('aria-hidden');
    };

    /**
     * Hides a sub-modal and shows the main vault modal.
     * @param {HTMLElement} subModalBackdrop The backdrop of the sub-modal to hide.
     */
    const closeSubModal = (subModalBackdrop) => {
        subModalBackdrop.setAttribute('aria-hidden', 'true');
        modalBackdrop.removeAttribute('aria-hidden');
    };

    // Event listener for opening the settings modal
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            openSubModal(settingsModalBackdrop);
        });
    }

    // Event listener for opening the info modal
    if (infoBtn) {
        infoBtn.addEventListener('click', () => {
            openSubModal(infoModalBackdrop);
        });
    }

    // Event listeners for closing the settings modal
    if (settingsModalClose) {
        settingsModalClose.addEventListener('click', () => {
            closeSubModal(settingsModalBackdrop);
        });
    }
    if (settingsModalBackdrop) {
        settingsModalBackdrop.addEventListener('click', (event) => {
            if (event.target === settingsModalBackdrop) {
                closeSubModal(settingsModalBackdrop);
            }
        });
    }

    // Event listeners for closing the info modal
    if (infoModalClose) {
        infoModalClose.addEventListener('click', () => {
            closeSubModal(infoModalBackdrop);
        });
    }
    if (infoModalBackdrop) {
        infoModalBackdrop.addEventListener('click', (event) => {
            if (event.target === infoModalBackdrop) {
                closeSubModal(infoModalBackdrop);
            }
        });
    }
}