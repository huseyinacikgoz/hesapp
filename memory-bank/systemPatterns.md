# System Patterns: Hesapp

## 1. Sistem Mimarisi

*   **İstemci Taraflı (Client-Side) Mimari:** Hesapp, tamamen istemci tarafında çalışan bir Tek Sayfa Uygulamasıdır (Single Page Application - SPA). Sunucu tarafı bir bileşeni veya veritabanı yoktur. Tüm mantık, veri işleme ve depolama kullanıcının tarayıcısında gerçekleşir.
*   **Sıfır Bilgi (Zero-Knowledge) Mimarisi:** Uygulama, kullanıcı verilerini (notlar ve şifre) asla sunucuya göndermez. Şifreleme ve şifre çözme işlemleri yalnızca cihazda yapıldığı için, geliştirici dahil hiç kimse kullanıcının verilerine erişemez.
 
## 2. Temel Tasarım Desenleri

*   **Modül Deseni (ES6 Modules):** Proje, modern JavaScript (ES6) modül sistemini kullanır. Her bir işlevsel birim (örn. `calculator.js`, `theme.js`, `vault.js`, `shortcuts.js`) kendi dosyasına sahiptir ve `export` ile dışa açtığı fonksiyonları/değişkenleri, ihtiyaç duyan diğer modüller `import` ile kullanır. Bu yapı, daha net bağımlılık yönetimi sağlar ve global isim alanını tamamen temiz tutar. Ana giriş noktası (`main.js`) tüm modülleri başlatır.
*   **Olay Yönlendirme (Event Delegation):** Hesap makinesi tuş takımı (`#pad`) gibi çok sayıda tıklanabilir öğe içeren alanlarda, her bir öğeye ayrı ayrı olay dinleyici eklemek yerine, ortak bir üst öğeye tek bir olay dinleyici eklenmiştir. Bu, performansı artırır ve DOM manipülasyonunu azaltır.
*   **Durum Yönetimi (State Management):**
    *   **Hesap Makinesi Durumu:** Hesap makinesinin mevcut değeri, önceki değeri, operatörü gibi durumlar JavaScript değişkenlerinde tutulur.
    *   **Uygulama Durumu:** Kasanın kilitli/açık olup olmadığı, hangi modal'ın gösterildiği gibi genel uygulama durumları, DOM sınıfları (`hidden`, `show`) ve JavaScript boolean değişkenleri ile yönetilir.
    *   **Kalıcı Durum:** Tema tercihi ve şifrelenmiş kasa verileri `localStorage` kullanılarak tarayıcıda saklanır.

## 3. Kritik Uygulama Akışları

*   **Tema Değiştirme:**
    1.  Kullanıcı tema değiştirme düğmesine tıklar.
    2.  Mevcut tema (`data-theme` attribute'u) okunur.
    3.  Tema tersine çevrilir (light -> dark, dark -> light).
    4.  Yeni tema `<html>` elementine `data-theme` attribute'u olarak atanır.
    5.  Yeni tema tercihi `localStorage`'a kaydedilir.
    6.  Sayfa ilk yüklendiğinde, FOUC (Flash of Unstyled Content) önlemek için `head` içindeki bir script, `localStorage`'daki temayı veya sistem tercihini okuyarak `data-theme` attribute'unu anında ayarlar.

*   **Kasa Şifreleme/Şifre Çözme:**
    1.  **Anahtar Türetme:** Kullanıcı şifresini girdiğinde, bu şifre ve `localStorage`'dan okunan `salt` (tuz) değeri, `PBKDF2` fonksiyonuna gönderilir. 600.000 iterasyon sonucunda 256-bit'lik bir şifreleme anahtarı (`CryptoKey`) türetilir.
    2.  **Şifreleme (Veri Kaydetme):** Not içeriği (string), `AES-GCM` algoritması, türetilen anahtar ve yeni oluşturulan bir `iv` (başlatma vektörü) kullanılarak şifrelenir. Sonuç, `iv`, `salt` ve şifreli metni içeren bir JSON nesnesi olarak birleştirilir ve Base64 formatında `localStorage`'a kaydedilir.
    3.  **Şifre Çözme (Veri Okuma):** `localStorage`'dan okunan Base64 veri çözülür. İçindeki `iv` ve şifreli metin, türetilen anahtar kullanılarak `AES-GCM` ile çözülür. Başarılı olursa, orijinal not içeriği elde edilir. Anahtar yanlışsa (şifre hatalıysa), şifre çözme işlemi başarısız olur.
    4.  **Sahte Şifre Kontrolü:** Gerçek şifre ile giriş başarısız olduğunda, sistem sahte şifreyi (`hesapp_aux_key_v1`) kontrol eder. Sahte şifre doğruysa, sahte kasa (`hesapp_aux_data_v1`) açılır ve gerçek kasa içeriği gizlenir. Sahte kasa, gerçek kasa ile aynı şifreleme yöntemiyle korunur ancak ayrı bir localStorage anahtarında saklanır. Gizlilik için genel isimler kullanılır. Eski anahtar adları migration desteği ile korunmaktadır.
    5.  **Çöp Kutusu (Soft Delete):** Notlar silindiğinde, eğer çöp kutusu özelliği aktifse (`hesapp_trash_bin_enabled_v1`), not verisine `isDeleted: true` ve `deletedDate` alanları eklenir. Bu notlar ana listede gizlenir ancak "Çöp Kutusu" görünümünde listelenir. Kullanıcı buradan notu geri yükleyebilir (`isDeleted: false`) veya kalıcı olarak silebilir (diziden tamamen çıkarılır). Çöp kutusu özelliği kapatıldığında, silinmiş tüm notlar kalıcı olarak temizlenir.

*   **Modal Yönetimi:**
    1.  **Backdrop Click ile Kapatma:** Tüm modallarda, backdrop (modal dışına) tıklandığında modal kapatılır. Modal içeriğine tıklandığında kapanmayı önlemek için `.modal` elementine `stopPropagation()` eklenir.
    2.  **Zamanlayıcı Koruması:** Belirli modallarda (örn. kasa giriş modal'ı) ilk birkaç saniye boyunca backdrop click ile kapatma devre dışı bırakılabilir. Bu, yanlışlıkla modal'ın kapanmasını önler. `showModal` fonksiyonuna `disableBackdropCloseForSeconds` parametresi ile kontrol edilir.
    3.  **Modal State Yönetimi:** Modal açık/kapalı durumu, backdrop elementinin `display` CSS özelliği ile kontrol edilir. `hideModal` fonksiyonu tüm modalları kapatır ve timeout'ları temizler.

*   **Tema ve Görsel Tutarlılık:**
    1.  **Koyu Mod Arka Plan:** Koyu modda tüm arka planlar sabit renk kullanır. Ana arka plan `var(--bg)` (#1a1b26), kartlar ve widget'lar `var(--panel)` (#24283b). Gradient'ler ve farklı renk tonları kaldırıldı.
    2.  **Tema Uyumlu Renkler:** Hamburger menü, butonlar ve diğer UI öğeleri tema değişkenlerini (`var(--accent)`, `var(--action-toggle-bg)`, `var(--op-key-bg)`) kullanır.
    3.  **Buton Efektleri:** Önemli butonlar (örn. "Hadi Başlayalım", hesap makinesi "=" tuşu) gradient background, shadow efektleri ve hover animasyonları ile vurgulanır.