# Active Context: Hesapp

## 1. Mevcut Odak
Sıradaki görev, mevcut "Kullanım Koşulları" metnini, uygulamanın doğasını ve kullanıcı sorumluluklarını daha net bir şekilde ortaya koyan, daha profesyonel ve kapsamlı bir "Hizmet Sözleşmesi" ile güncellemektir.
 
## 2. Son Değişiklikler
*   **Sürüm Güncellemesi:** Proje sürümü `1.2.2` olarak güncellendi.
*   **Yeni Görevler Eklendi:** `progress.md` dosyası, PWA dönüşümü, yasal metinlerin eklenmesi ve "Nasıl Kullanılır?" sayfasının iyileştirilmesi gibi yeni görevlerle güncellendi.
*   **PWA Manifest Hazırlığı:** `site.webmanifest` dosyasına uygulamanın adı eklendi.
*   **Gizlilik Politikası Birleştirildi:** "Gizlilik & Güvenlik" modalı, resmi gizlilik politikasını da içerecek şekilde güncellendi ve tek, kapsamlı bir bilgilendirme ekranı haline getirildi.
*   **"Nasıl Kullanılır?" İyileştirmesi:** "Nasıl Kullanılır?" modalının içeriği, uygulamanın özelliklerini daha akıcı ve kullanıcı odaklı bir dille anlatacak şekilde yeniden yazıldı.
*   **PWA Temeli Atıldı:** Uygulamanın temel dosyalarını önbelleğe alan ve çevrimdışı çalışmasını sağlayan bir `service-worker.js` dosyası oluşturuldu ve `index.html`'e kaydedildi.
*   **PWA Güncelleme Mekanizması:** Yeni bir sürüm algılandığında kullanıcıya bir bildirim banner'ı gösteren ve uygulamayı güncellemesini sağlayan mekanizma eklendi.
*   **PWA Kurulum Butonu:** Kullanıcının uygulamayı daha kolay kurabilmesi için "Bilgi" menüsüne "Uygulamayı Yükle" butonu eklendi.
*   **Veri Onay Banner'ı Kaldırıldı:** Kullanıcı isteği üzerine, `localStorage` kullanımıyla ilgili onay banner'ı ve ilgili kodlar projeden temizlendi.

## 3. Sonraki Adımlar
1.  `index.html` dosyasındaki `termsBackdrop` modalının başlığını ve içeriğini yeni "Hizmet Sözleşmesi" metniyle değiştir.
2.  Yeni metnin yasal olarak gerekli tüm temel maddeleri (sorumluluk reddi, kullanıcı yükümlülükleri vb.) kapsadığından emin ol.

## 4. Önemli Çıkarımlar ve Tercihler

*   **Vanilla Yaklaşımı:** Proje, harici kütüphanelerden arındırılmış, saf (vanilla) HTML, CSS ve JavaScript kullanmaktadır. Bu yaklaşım, hafifliği ve bağımlılıkların olmamasını önceliklendirir. Gelecekteki geliştirmelerde de bu tercihe sadık kalınmalıdır.
*   **Güvenlik Önceliği:** Tüm kriptografik işlemler, tarayıcının yerel Web Crypto API'si kullanılarak ve "sıfır bilgi" prensibine sıkı sıkıya bağlı kalarak yapılmaktadır. Güvenlik ve gizlilikle ilgili her türlü değişiklik bu prensibi korumalıdır.
*   **Kullanıcı Kontrolü:** Otomatik kilitleme süresinin ayarlanabilir yapılması gibi, kullanıcılara uygulama davranışı üzerinde kontrol sağlayan özellikler tercih edilmektedir.