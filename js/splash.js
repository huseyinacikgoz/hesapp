import { showSecurityModal, showTermsModal, showAboutModal, showHowToUseModal } from './vault/ui.js';

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
            welcomePage.classList.remove('hidden'); // Varsa hidden sınıfını kaldır
            welcomePage.style.display = ''; // Inline stili temizle ki CSS kuralları geçerli olsun
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
            // display: none yerine visibility: hidden kullan
            // Bu sayede body flex layout'u bozulmuyor
            welcomePage.style.visibility = 'hidden';
            welcomePage.style.opacity = '0';
            welcomePage.style.pointerEvents = 'none';
            if (device) device.classList.remove('hidden');
        }, 400); // CSS'teki transition süresiyle aynı olmalı
    });

    // Footer linklerine modal açma event listener'ları
    setTimeout(() => {
        if (welcomePage) {
            setupWelcomeFooterLinks(welcomePage);
            setupPricingCards(welcomePage);
            setupWelcomeSidebarMenu(welcomePage);
        }
    }, 200);
}

/**
 * Welcome page footer linklerini ayarlar
 */
function setupWelcomeFooterLinks(welcomePage) {
    const welcomePrivacyLink = document.getElementById('welcomePrivacyLink');
    const welcomeTermsLink = document.getElementById('welcomeTermsLink');
    const welcomeHowToUseLink = document.getElementById('welcomeHowToUseLink');
    const welcomeAboutLink = document.getElementById('welcomeAboutLink');

    // Welcome page'i tekrar öne almak için fonksiyon
    const restoreWelcomePageZIndex = () => {
        welcomePage.style.zIndex = '150'; // Welcome page'i tekrar öne al
    };

    if (welcomePrivacyLink) {
        welcomePrivacyLink.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            // Modal'ı aç, welcome page'i gizleme - z-index ile arkaya al
            welcomePage.style.zIndex = '40'; // Modal backdrop z-index: 50, welcome page'i arkaya al
            showSecurityModal(restoreWelcomePageZIndex);
        });
    }

    if (welcomeTermsLink) {
        welcomeTermsLink.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            // Modal'ı aç, welcome page'i gizleme - z-index ile arkaya al
            welcomePage.style.zIndex = '40'; // Modal backdrop z-index: 50, welcome page'i arkaya al
            showTermsModal(false, restoreWelcomePageZIndex);
        });
    }

    if (welcomeHowToUseLink) {
        welcomeHowToUseLink.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            // Modal'ı aç, welcome page'i gizleme - z-index ile arkaya al
            welcomePage.style.zIndex = '40'; // Modal backdrop z-index: 50, welcome page'i arkaya al
            showHowToUseModal(restoreWelcomePageZIndex);
        });
    }

    if (welcomeAboutLink) {
        welcomeAboutLink.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            // Modal'ı aç, welcome page'i gizleme - z-index ile arkaya al
            welcomePage.style.zIndex = '40'; // Modal backdrop z-index: 50, welcome page'i arkaya al
            showAboutModal(restoreWelcomePageZIndex);
        });
    }
}

/**
 * Pricing kartlarını ayarlar - seçim ve buton işlevselliği
 */
function setupPricingCards(welcomePage) {
    const pricingCards = document.querySelectorAll('.pricing-card');
    const welcomeCloseBtn = document.getElementById('welcomeClose');

    if (!pricingCards || pricingCards.length === 0) {
        return;
    }

    // İlk açılışta Pro planını seçili yap
    const proCard = Array.from(pricingCards).find(card => card.dataset.plan === 'pro');
    if (proCard) {
        proCard.classList.add('selected');
    }

    pricingCards.forEach(card => {
        const plan = card.dataset.plan;
        const button = card.querySelector('.pricing-btn');

        if (!plan) {
            return;
        }

        // Kart tıklaması
        card.addEventListener('click', (e) => {
            // Butona tıklanmışsa, butonun kendi handler'ı çalışsın
            if (e.target.closest('.pricing-btn')) {
                return;
            }

            // Diğer kartları seçimden çıkar
            pricingCards.forEach(c => c.classList.remove('selected'));

            // Bu kartı seç
            card.classList.add('selected');
        });

        // Buton tıklaması
        if (button) {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();

                // Tüm kartları seçimden çıkar
                pricingCards.forEach(c => c.classList.remove('selected'));

                // Bu kartı seç
                card.classList.add('selected');

                // Plan'a göre işlem yap
                if (plan === 'free') {
                    // Ücretsiz plan - welcome page'i kapat
                    if (welcomeCloseBtn) {
                        welcomeCloseBtn.click();
                    }
                } else if (plan === 'premium') {
                    // Premium plan - geliştiriciye destek (99 TL)
                    window.open('https://kreosus.com/huseyinacikgoz', '_blank');
                } else if (plan === 'pro') {
                    // Pro plan - geliştiriciye destek (999 TL)
                    window.open('https://kreosus.com/huseyinacikgoz', '_blank');
                }
            });
        }
    });
}

/**
 * Welcome page hamburger menü linklerini ayarlar - smooth scroll
 */
function setupWelcomeSidebarMenu(welcomePage) {
    const hamburgerBtn = document.getElementById('welcome-hamburger-btn');
    const hamburgerMenu = document.getElementById('welcome-hamburger-menu');
    const menuItems = document.querySelectorAll('#welcome-hamburger-menu .welcome-menu-item');

    if (!hamburgerBtn || !hamburgerMenu || !menuItems || menuItems.length === 0) {
        return;
    }

    // Create backdrop for closing menu on outside click
    let menuBackdrop = document.getElementById('welcome-menu-backdrop');
    if (!menuBackdrop) {
        menuBackdrop = document.createElement('div');
        menuBackdrop.id = 'welcome-menu-backdrop';
        welcomePage.appendChild(menuBackdrop);
    }

    // Get menu and close icons
    const menuIcon = document.getElementById('welcome-hamburger-icon');
    const closeIcon = document.getElementById('welcome-close-icon');

    // Toggle menu visibility
    const toggleMenu = () => {
        const isOpen = hamburgerMenu.classList.contains('show');
        if (isOpen) {
            hamburgerMenu.classList.remove('show');
            menuBackdrop.classList.remove('show');
            // Show menu icon, hide close icon
            if (menuIcon) menuIcon.classList.remove('hidden');
            if (closeIcon) closeIcon.classList.add('hidden');
            // Re-enable body scroll
            document.body.style.overflow = '';
            if (welcomePage) {
                welcomePage.style.overflow = '';
            }
        } else {
            hamburgerMenu.classList.add('show');
            menuBackdrop.classList.add('show');
            // Hide menu icon, show close icon
            if (menuIcon) menuIcon.classList.add('hidden');
            if (closeIcon) closeIcon.classList.remove('hidden');
            // Don't disable body scroll - let menu scroll independently
        }
    };

    // Close menu
    const closeMenu = () => {
        hamburgerMenu.classList.remove('show');
        menuBackdrop.classList.remove('show');
        // Show menu icon, hide close icon
        if (menuIcon) menuIcon.classList.remove('hidden');
        if (closeIcon) closeIcon.classList.add('hidden');
        // Re-enable body scroll
        document.body.style.overflow = '';
        if (welcomePage) {
            welcomePage.style.overflow = '';
        }
    };

    // Hamburger button click
    hamburgerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });

    // Close menu when clicking backdrop
    menuBackdrop.addEventListener('click', closeMenu);

    // Menu item clicks
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const href = item.getAttribute('href');

            // If it's an external link (not starting with #), allow default behavior
            if (!href || !href.startsWith('#')) {
                // Close menu before navigating
                closeMenu();
                return; // Allow default link behavior
            }

            // For internal links, prevent default and handle smooth scroll
            e.preventDefault();
            e.stopPropagation();

            const targetId = href.substring(1); // Remove '#'

            // Close menu first
            closeMenu();

            // Scroll to target
            if (targetId === 'top') {
                // Scroll to top of welcome page
                if (welcomePage) {
                    welcomePage.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                }
            } else {
                const targetElement = document.getElementById(targetId);

                if (targetElement && welcomePage) {
                    // Calculate scroll position relative to welcome page
                    const welcomePageRect = welcomePage.getBoundingClientRect();
                    const targetRect = targetElement.getBoundingClientRect();
                    const scrollTop = welcomePage.scrollTop;
                    const targetOffset = targetRect.top - welcomePageRect.top + scrollTop - 80; // 80px offset for header

                    // Smooth scroll within welcome page
                    welcomePage.scrollTo({
                        top: Math.max(0, targetOffset),
                        behavior: 'smooth'
                    });
                }
            }

            // Update active state
            menuItems.forEach(menuItem => menuItem.classList.remove('active'));
            item.classList.add('active');

            // Remove active state after scroll completes
            setTimeout(() => {
                item.classList.remove('active');
            }, 1000);
        });
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && hamburgerMenu.classList.contains('show')) {
            closeMenu();
        }
    });

    // Update active menu item based on scroll position
    const handleScroll = () => {
        if (!welcomePage) return;

        const sections = [
            { id: 'top', element: welcomePage.querySelector('main#top') },
            { id: 'neden-hesapp', element: document.getElementById('neden-hesapp') },
            { id: 'ucretlendirme', element: document.getElementById('ucretlendirme') },
            { id: 'ekibimiz', element: document.getElementById('ekibimiz') }
        ];

        const welcomePageScrollTop = welcomePage.scrollTop;
        const scrollPosition = welcomePageScrollTop + 100; // Offset for header

        // Check if we're at the top
        if (welcomePageScrollTop < 50) {
            menuItems.forEach(menuItem => {
                menuItem.classList.remove('active');
                if (menuItem.getAttribute('href') === '#top') {
                    menuItem.classList.add('active');
                }
            });
            return;
        }

        sections.forEach((section, index) => {
            if (!section.element) return;

            // Skip 'top' section in loop
            if (section.id === 'top') return;

            // Get section position relative to welcome page
            const welcomePageRect = welcomePage.getBoundingClientRect();
            const sectionRect = section.element.getBoundingClientRect();
            const sectionTop = sectionRect.top - welcomePageRect.top + welcomePageScrollTop;
            const sectionBottom = sectionTop + section.element.offsetHeight;
            const nextSection = sections[index + 1];
            let nextSectionTop = Infinity;

            if (nextSection && nextSection.element && nextSection.id !== 'top') {
                const nextSectionRect = nextSection.element.getBoundingClientRect();
                nextSectionTop = nextSectionRect.top - welcomePageRect.top + welcomePageScrollTop;
            }

            if (scrollPosition >= sectionTop &&
                (nextSection && nextSection.id !== 'top' ? scrollPosition < nextSectionTop : scrollPosition < sectionBottom)) {
                // Update active menu item
                menuItems.forEach(menuItem => {
                    menuItem.classList.remove('active');
                    if (menuItem.getAttribute('href') === `#${section.id}`) {
                        menuItem.classList.add('active');
                    }
                });
            }
        });
    };

    // Throttle scroll event on welcome page
    let scrollTimeout;
    welcomePage.addEventListener('scroll', () => {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(handleScroll, 100);
    }, { passive: true });

    // Initial check
    handleScroll();
}