/**
 * Ekranda özel bir bildirim (toast) mesajı gösterir.
 * @param {string} message - Gösterilecek mesaj.
 */
export function showCustomToast(message) {
    // Zaten bir toast varsa yenisini oluşturma
    if (document.querySelector('.copy-toast')) return;

    const toast = document.createElement('div');
    toast.textContent = message;
    toast.className = 'copy-toast';
    document.querySelector('.screen').appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 2000); // 2 saniye ekranda kalacak
}