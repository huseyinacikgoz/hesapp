# Active Context: Hesapp

## 1. Mevcut Odak
Kullanıcı tarafından talep edilen yeni özelliklerin planlanması ve Hafıza Bankası'na kaydedilmesi. Bu özellikler, uygulamanın güvenliğini ve kullanılabilirliğini artırmayı hedeflemektedir.

## 2. Son Değişiklikler
*   Hafıza Bankası dosyaları (`progress.md` ve `activeContext.md`) yeni geliştirme görevlerini içerecek şekilde güncellendi.
*   Uygulanacak özellikler listesi netleştirildi.

## 3. Sonraki Adımlar
`progress.md` dosyasında listelenen yeni özelliklerin uygulanmasına başlanacak. İlk görev, **"1. Otomatik Kilitleme"** özelliğini geliştirmek olacaktır.

## 4. Önemli Çıkarımlar ve Tercihler

*   **Vanilla Yaklaşımı:** Proje, harici kütüphanelerden arındırılmış, saf (vanilla) HTML, CSS ve JavaScript kullanmaktadır. Bu yaklaşım, hafifliği ve bağımlılıkların olmamasını önceliklendirir. Gelecekteki geliştirmelerde de bu tercihe sadık kalınmalıdır.
*   **Güvenlik Önceliği:** Tüm kriptografik işlemler, tarayıcının yerel Web Crypto API'si kullanılarak ve "sıfır bilgi" prensibine sıkı sıkıya bağlı kalarak yapılmaktadır. Güvenlik ve gizlilikle ilgili her türlü değişiklik bu prensibi korumalıdır.