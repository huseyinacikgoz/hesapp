# Technical Context: Hesapp

## 1. Kullanılan Teknolojiler

*   **Frontend:**
    *   **HTML5:** Uygulamanın yapısal iskeleti için standart ve semantik HTML5 etiketleri kullanılmaktadır.
    *   **CSS3:** Modern CSS3 özellikleri, özellikle CSS Değişkenleri (Variables) ile dinamik tema (açık/koyu mod) yönetimi sağlanmaktadır. Arayüz `Flexbox` ve `Grid` ile oluşturulmuştur. Ana hesap makinesi ve kasa arayüzü vanilla CSS kullanmaktadır.
    *   **Tailwind CSS (CDN):** Welcome page ve bazı UI bileşenleri için Tailwind CSS CDN kullanılmaktadır. Bu, modern ve responsive tasarım için hızlı geliştirme sağlar. CDN tabanlı olduğu için build süreci gerektirmez.
    *   **Vanilla JavaScript (ES6+ Modules):** Proje, harici framework'lere dayanmamaktadır. Tüm işlevsellik, modern tarayıcıların desteklediği standart JavaScript ile yazılmıştır. Kod, ES6 Modül sistemi (`import`/`export`) kullanılarak organize edilmiştir.
 
*   **Güvenlik ve Şifreleme:**
    *   **Web Crypto API (`SubtleCrypto`):** Tarayıcıda yerleşik olarak bulunan bu güçlü API, tüm kriptografik işlemler için kullanılır.
        *   **AES-GCM:** Not verilerinin şifrelenmesi ve bütünlüğünün korunması için kullanılır.
        *   **PBKDF2:** Kullanıcı parolasından güvenli bir şifreleme anahtarı türetmek için 600.000 iterasyon ile kullanılır.

*   **Veri Depolama:**
    *   **`localStorage`:** Şifrelenmiş kasa verilerinin ve seçilen tema tercihinin oturumlar arasında kalıcı olarak saklanması için kullanılır.
        *   **Anahtar İsimleri:**
            *   `kasa_encrypted_v1`: Gerçek kasa verileri (şifrelenmiş)
            *   `hesapp_aux_key_v1`: Sahte şifre hash'i (salt + hash, opsiyonel, gizlilik için genel isim)
            *   `hesapp_aux_data_v1`: Sahte kasa verileri (şifrelenmiş, opsiyonel, gizlilik için genel isim)
            *   `hesapp_theme_v1`: Tema tercihi
            *   `hesapp_terms_accepted_v1`: Kullanım koşulları onayı
            *   `hesapp_autolock_timeout_v1`: Otomatik kilitleme süresi
            *   `hesapp_login_attempts_v1`: Giriş denemeleri (brute-force koruması için)
            *   `hesapp_show_welcome_on_startup`: Welcome page gösterim tercihi
            *   **Not:** Sahte şifre artık hash'lenmiş olarak saklanır (PBKDF2, 600.000 iterasyon) ve localStorage'da açık metin olarak görünmez. Anahtar isimleri de gizlilik için genel isimler kullanır. Eski anahtar adları (`hesapp_honey_password_v1`, `hesapp_honey_vault_v1`) migration desteği ile korunmaktadır.

## 2. Geliştirme Ortamı ve Araçlar

*   **Bağımlılık Yönetimi:** Proje, harici bir paket yöneticisi (npm, yarn vb.) kullanmamaktadır. Tüm kodlar yereldir.
*   **Build Süreci:** Herhangi bir derleme veya paketleme (bundling) adımı yoktur. Proje, statik dosyaların doğrudan sunulmasıyla çalışır.
*   **Önbellek Yönetimi (Cache Busting):** Statik dosyalara (`.css`, `.js`) sürüm numarası içeren sorgu parametreleri (`?v=1.3.98`) eklenerek yeni sürümlerde tarayıcı önbelleğinin otomatik olarak güncellenmesi sağlanır. Tüm dosyalarda sürüm numarası v1.3.98 olarak tutarlı şekilde güncellenmiştir.
*   **Açık Kaynak:** Hesapp artık açık kaynak bir projedir. GitHub repository: https://github.com/huseyinacikgoz/Hesapp. MIT lisansı altında lisanslanmıştır.

## 3. Modül Yapısı

*   **Ana Modüller:**
    *   `main.js`: Uygulamanın ana giriş noktası, tüm modülleri başlatır
    *   `calculator/calculator.js`: Hesap makinesi işlevselliği
    *   `vault/vault.js`: Kasa tetikleme ve otomatik kilitleme mantığı
    *   `vault/ui.js`: Kasa kullanıcı arayüzü ve işlemleri
    *   `vault/crypto.js`: Şifreleme ve şifre çözme fonksiyonları
    *   `theme.js`: Tema yönetimi (açık/koyu mod)
    *   `toast.js`: Bildirim sistemi (toast mesajları)
    *   `splash.js`: Açılış ekranı ve welcome page yönetimi
    *   `pwa.js`: Progressive Web App özellikleri (service worker yönetimi)
    *   `shortcuts.js`: Klavye kısayolları yönetimi

## 4. Teknik Kısıtlamalar

*   **Tarayıcı Uyumluluğu:** Web Crypto API ve ES6 Modüllerini destekleyen modern tarayıcılar (Chrome, Firefox, Safari, Edge'in güncel sürümleri) gereklidir.