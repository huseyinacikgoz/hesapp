# Active Context: Hesapp

## 1. Mevcut Odak
`v1.3.0` sürümü tamamlandı. Uygulama, yeni özellikler veya iyileştirmeler için bir sonraki geliştirme döngüsüne hazır.
 
## 2. Son Değişiklikler
*   **Sürüm Güncellemesi:** Proje sürümü `1.3.0` olarak güncellendi.
*   **Hizmet Sözleşmesi:** "Kullanım Koşulları" metni, uygulamanın "olduğu gibi" sunulduğunu, veri kaybı sorumluluğunun kullanıcıya ait olduğunu ve şifre kurtarma imkanı olmadığını netleştiren kapsamlı bir "Hizmet Sözleşmesi" ile değiştirildi.
*   **PWA Entegrasyonu:**
    *   Uygulamanın çevrimdışı çalışabilmesi ve kurulabilmesi için `service-worker.js` eklendi.
    *   Yeni sürüm çıktığında kullanıcıyı bilgilendiren ve güncelleme imkanı sunan bir mekanizma entegre edildi.
    *   "Bilgi" menüsüne, uygulamanın PWA olarak kurulmasını tetikleyen bir "Uygulamayı Yükle" butonu eklendi.
*   **UI/UX İyileştirmeleri:**
    *   "Nasıl Kullanılır?" ve "Gizlilik Politikası" gibi yasal metinlerin içeriği daha anlaşılır ve kullanıcı dostu bir dille yeniden düzenlendi.
    *   Gereksiz görülen `localStorage` onay banner'ı kaldırıldı.

## 3. Sonraki Adımlar
*   Yeni özellikler veya iyileştirmeler için görev listesi oluştur.

## 4. Önemli Çıkarımlar ve Tercihler

*   **Vanilla Yaklaşımı:** Proje, harici kütüphanelerden arındırılmış, saf (vanilla) HTML, CSS ve JavaScript kullanmaktadır. Bu yaklaşım, hafifliği ve bağımlılıkların olmamasını önceliklendirir. Gelecekteki geliştirmelerde de bu tercihe sadık kalınmalıdır.
*   **Güvenlik Önceliği:** Tüm kriptografik işlemler, tarayıcının yerel Web Crypto API'si kullanılarak ve "sıfır bilgi" prensibine sıkı sıkıya bağlı kalarak yapılmaktadır. Güvenlik ve gizlilikle ilgili her türlü değişiklik bu prensibi korumalıdır.
*   **Kullanıcı Kontrolü:** Otomatik kilitleme süresinin ayarlanabilir yapılması gibi, kullanıcılara uygulama davranışı üzerinde kontrol sağlayan özellikler tercih edilmektedir.