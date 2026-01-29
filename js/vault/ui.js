// ui.js - Main Orchestrator for Vault UI
// This file aggregates functionality from sub-modules and provides the main initialization point.

import { setupInfoHandlers, showTermsModal, showSecurityModal, showAboutModal, showHowToUseModal } from './ui/info-modals.js';
import { setupSettingsHandlers } from './ui/settings-modals.js';
import { showModal, hideModal, showConfirmation } from './ui/modal-manager.js';
import { showVaultManagementScreen } from './ui/vault-list.js';
import { openVaultAccessMode } from './ui/vault-access.js';

// Re-export functions used by other modules (e.g. vault.js, main.js)
export {
    showModal,
    hideModal,
    showConfirmation,
    showVaultManagementScreen,
    openVaultAccessMode,
    showTermsModal,
    showSecurityModal,
    showAboutModal,
    showHowToUseModal
};

/**
 * Initializes the Vault UI by setting up event handlers for modals and settings.
 * This should be called when the application starts.
 */
export function initVaultUI() {
    setupInfoHandlers();
    setupSettingsHandlers();
}