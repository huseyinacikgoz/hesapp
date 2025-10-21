# Technical Context: Hesapp

## 1. Kullanılan Teknolojiler

*   **Frontend:**
    *   **HTML5:** Uygulamanın yapısal iskeleti için standart ve semantik HTML5 etiketleri kullanılmaktadır.
    *   **CSS3:** Modern CSS3 özellikleri, özellikle CSS Değişkenleri (Variables) ile dinamik tema (açık/koyu mod) yönetimi sağlanmaktadır. Arayüz `Flexbox` ve `Grid` ile oluşturulmuştur.
    *   **Vanilla JavaScript (ES6+):** Proje, herhangi bir harici kütüphane veya framework'e dayanmamaktadır. Tüm işlevsellik, modern tarayıcıların desteklediği standart JavaScript (ECMAScript 6 ve sonrası) ile yazılmıştır.

*   **Güvenlik ve Şifreleme:**
    *   **Web Crypto API (`SubtleCrypto`):** Tarayıcıda yerleşik olarak bulunan bu güçlü API, tüm kriptografik işlemler için kullanılır.
        *   **AES-GCM:** Not verilerinin şifrelenmesi ve bütünlüğünün korunması için kullanılır.
        *   **PBKDF2:** Kullanıcı parolasından güvenli bir şifreleme anahtarı türetmek için 600.000 iterasyon ile kullanılır.

*   **Veri Depolama:**
    *   **`localStorage`:** Şifrelenmiş kasa verilerinin ve seçilen tema tercihinin oturumlar arasında kalıcı olarak saklanması için kullanılır.

## 2. Geliştirme Ortamı ve Araçlar

*   **Bağımlılık Yönetimi:** Proje, harici bir paket yöneticisi (npm, yarn vb.) kullanmamaktadır. Tüm kodlar (`script.js`, `style.css`) yereldir.
*   **Build Süreci:** Herhangi bir derleme veya paketleme (bundling) adımı yoktur. Proje, statik dosyaların doğrudan sunulmasıyla çalışır.

## 3. Teknik Kısıtlamalar

*   **Çevrimdışı Çalışma:** Proje, bir Service Worker'a sahip olmadığı için tam çevrimdışı desteği sunmaz, ancak bir kez yüklendikten sonra internet bağlantısı olmadan çalışabilir.
*   **Tarayıcı Uyumluluğu:** Web Crypto API'yi destekleyen modern tarayıcılar (Chrome, Firefox, Safari, Edge'in güncel sürümleri) gereklidir.