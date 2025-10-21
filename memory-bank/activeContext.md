# Active Context: Hesapp

## 1. Mevcut Odak
Tüm planlanmış görevler tamamlandı. Proje stabil durumda ve yeni görev veya özellik taleplerini bekliyor.

## 2. Son Değişiklikler
*   **Otomatik Kilitleme** özelliği eklendi. Kasa, belirli bir süre işlem yapılmadığında otomatik olarak kilitleniyor.
*   Otomatik kilitleme süresinin (1, 3, 5, 10 dk, Asla) kullanıcı tarafından ayarlanabilmesi için **Ayarlar menüsüne yeni bir seçenek** ve modal eklendi.
*   Kullanıcıya rehberlik etmek amacıyla **"Nasıl Kullanılır?" modalı** oluşturuldu ve ilgili ekranlara bağlantıları eklendi.
*   **Brute-Force Koruması** eklendi. Art arda yapılan hatalı şifre denemeleri, artan bekleme süreleriyle yavaşlatılıyor.
*   **Önbellek Temizleme** mekanizması, statik dosyalara sürüm parametresi eklenerek uygulandı.
*   Hafıza Bankası, tamamlanan bu görevleri yansıtacak şekilde güncellendi.

## 3. Sonraki Adımlar
Kullanıcıdan yeni bir özellik talebi veya görevlendirme bekleniyor.

## 4. Önemli Çıkarımlar ve Tercihler

*   **Vanilla Yaklaşımı:** Proje, harici kütüphanelerden arındırılmış, saf (vanilla) HTML, CSS ve JavaScript kullanmaktadır. Bu yaklaşım, hafifliği ve bağımlılıkların olmamasını önceliklendirir. Gelecekteki geliştirmelerde de bu tercihe sadık kalınmalıdır.
*   **Güvenlik Önceliği:** Tüm kriptografik işlemler, tarayıcının yerel Web Crypto API'si kullanılarak ve "sıfır bilgi" prensibine sıkı sıkıya bağlı kalarak yapılmaktadır. Güvenlik ve gizlilikle ilgili her türlü değişiklik bu prensibi korumalıdır.
*   **Kullanıcı Kontrolü:** Otomatik kilitleme süresinin ayarlanabilir yapılması gibi, kullanıcılara uygulama davranışı üzerinde kontrol sağlayan özellikler tercih edilmektedir.