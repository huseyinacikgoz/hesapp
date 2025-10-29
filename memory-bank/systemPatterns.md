# System Patterns: Hesapp

## 1. Sistem Mimarisi

*   **İstemci Taraflı (Client-Side) Mimari:** Hesapp, tamamen istemci tarafında çalışan bir Tek Sayfa Uygulamasıdır (Single Page Application - SPA). Sunucu tarafı bir bileşeni veya veritabanı yoktur. Tüm mantık, veri işleme ve depolama kullanıcının tarayıcısında gerçekleşir.
*   **Sıfır Bilgi (Zero-Knowledge) Mimarisi:** Uygulama, kullanıcı verilerini (notlar ve şifre) asla sunucuya göndermez. Şifreleme ve şifre çözme işlemleri yalnızca cihazda yapıldığı için, geliştirici dahil hiç kimse kullanıcının verilerine erişemez.
 
## 2. Temel Tasarım Desenleri

*   **Modül Deseni (JavaScript):** Kod, `script.js` içinde IIFE (Immediately Invoked Function Expression) yapısı kullanılarak farklı sorumluluklara (UI, Kripto, Hesap Makinesi, Modal Yönetimi vb.) sahip modüllere ayrılmıştır. Bu, global namespace kirliliğini önler ve kodun daha organize olmasını sağlar.
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