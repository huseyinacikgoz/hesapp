const themeToggle = document.getElementById('themeToggle');
const docElement = document.documentElement;
const themeKey = 'hesapp_theme_v1';

/**
 * Temayı değiştirir (açık/koyu) ve tercihi localStorage'a kaydeder.
 */
function toggleTheme() {
    const currentTheme = docElement.getAttribute('data-theme');
    let newTheme;
    if (currentTheme === 'dark') {
        docElement.removeAttribute('data-theme');
        localStorage.setItem(themeKey, 'light');
        docElement.classList.remove('dark');
        newTheme = 'light';
    } else {
        docElement.setAttribute('data-theme', 'dark');
        localStorage.setItem(themeKey, 'dark');
        docElement.classList.add('dark');
        newTheme = 'dark';
    }

    // Google Analytics: Tema değiştirme olayını gönder
    if (typeof gtag === 'function') {
        gtag('event', 'theme_changed', {
            'theme': newTheme
        });
    }
}

/**
 * Sistem temasındaki değişiklikleri dinler ve uygular.
 * @param {MediaQueryListEvent} e - Medya sorgusu olayı.
 */
function handleSystemThemeChange(e) {
    // Sadece kullanıcı manuel bir tema seçimi yapmadıysa sistem temasını uygula.
    if (localStorage.getItem(themeKey) === null) {
        if (e.matches) {
            docElement.setAttribute('data-theme', 'dark');
            docElement.classList.add('dark');
        } else {
            docElement.removeAttribute('data-theme');
            docElement.classList.remove('dark');
        }
    }
}

export function initTheme() {
    themeToggle.addEventListener('click', toggleTheme);
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', handleSystemThemeChange);
}