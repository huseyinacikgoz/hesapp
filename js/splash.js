/* Bu modül artık başka modülleri import etmiyor, sadece DOM manipülasyonu yapıyor. */

/**
 * Açılış ekranı (splash screen) ve karşılama sayfası yönetimini başlatır.
 */
export function initSplashScreen() {
    const splashScreen = document.getElementById('splash-screen');
    const welcomePage = document.getElementById('welcome-page');
    const device = document.querySelector('.device');
    const welcomeCloseBtn = document.getElementById('welcomeClose');
    
    const showWelcomeKey = 'hesapp_show_welcome_on_startup';

    // Cihazı başlangıçta gizle
    if (device) device.classList.add('hidden');

    // 1. Adım: Splash ekranını 1 saniye göster
    setTimeout(() => {
        splashScreen.classList.add('hidden');

        // 2. Adım: Splash kaybolduktan sonra hoşgeldin sayfasını kontrol et
        const shouldShowWelcome = localStorage.getItem(showWelcomeKey);

        // Eğer ayar 'false' değilse (yani 'true' veya hiç ayarlanmamışsa) göster.
        if (shouldShowWelcome !== 'false') {
            // Eğer daha önce gösterilmediyse, hoşgeldin sayfasını göster
            welcomePage.style.display = 'flex';
            setTimeout(() => welcomePage.classList.add('visible'), 20);
        } else {
            // Eğer daha önce gösterildiyse, doğrudan hesap makinesini göster
            // ve sayfa başlığını daha sade hale getir.
            document.title = 'Hesapp - Hesap Makinesi';
            if (device) device.classList.remove('hidden');
        }
    }, 1000); // 1 saniye bekleme süresi

    // 3. Adım: Hoşgeldin sayfasındaki "Başla" butonuna tıklanınca
    welcomeCloseBtn.addEventListener('click', () => {
        // Sadece karşılama ekranını kapat, kalıcı ayarı değiştirme.
        // ve sayfa başlığını daha sade hale getir.
        document.title = 'Hesapp - Hesap Makinesi';
        welcomePage.classList.remove('visible');
        setTimeout(() => {
            welcomePage.style.display = 'none';
            if (device) device.classList.remove('hidden');
        }, 400); // CSS'teki transition süresiyle aynı olmalı
    });

    // --- Sayfa benzeri içerik yönetimi ---
    const mainContent = document.getElementById('welcome-main-content');
    const pageContents = document.querySelectorAll('.welcome-page-content');

    function showPageContent(pageId) {
        mainContent.style.display = 'none';
        pageContents.forEach(p => p.style.display = 'none');
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.style.display = 'flex';
            window.scrollTo(0, 0);
        }
    }

    function showMainContent() {
        pageContents.forEach(p => p.style.display = 'none');
        mainContent.style.display = 'block';
    }

    // document.getElementById('welcomePrivacyLink')?.addEventListener('click', (e) => { e.preventDefault(); showPageContent('welcome-page-content-privacy'); });
    // document.getElementById('welcomeTermsLink')?.addEventListener('click', (e) => { e.preventDefault(); showPageContent('welcome-page-content-terms'); });
    // document.getElementById('welcomeAboutLink')?.addEventListener('click', (e) => { e.preventDefault(); showPageContent('welcome-page-content-about'); });
    document.querySelectorAll('.welcome-page-back-btn').forEach(btn => btn.addEventListener('click', showMainContent));

}