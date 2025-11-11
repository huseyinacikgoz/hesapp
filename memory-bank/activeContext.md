# Active Context: Hesapp

## 1. Mevcut Odak
`v1.3.7` sürümü üzerinde çalışılmaktadır. Uygulama, modüler mimariye geçiş sonrası kullanıcı deneyimini iyileştirmek için arayüz yenilemeleri, modern tasarım güncellemeleri ve hata düzeltmeleri üzerinde çalışılmaktadır. Son dönemde UI/UX iyileştirmeleri, hata yönetimi ve mobil uyumluluk üzerine odaklanılmıştır.
 
## 2. Son Değişiklikler
*   **Sürüm Tutarlılığı:** Tüm dosyalardaki sürüm numaraları v1.3.7 olarak güncellendi (index.html, service-worker.js, CSS/JS cache busting parametreleri).
*   **Hata Düzeltmeleri:** index.html'deki duplikasyon hatası (225. satır) düzeltildi. Gizlilik Politikası'ndaki tarih tutarsızlığı giderildi.
*   **Not Önceliklendirme (Favoriler):** Notları favori olarak işaretleme özelliği eklendi. Favori notlar yıldız ikonu ile gösterilir ve liste başında sıralanır. Favori ekleme/çıkarma sadece not düzenleme ekranından yapılabilir.
*   **Klavye Kısayolları:** Hesap makinesi, kasa yönetimi ve modallar için kapsamlı klavye kısayolları eklendi. Yeni modül: `js/shortcuts.js`.
*   **Geri Yükleme Sorunu Düzeltildi:** Yedekten geri yükleme işlemi sonrası hata mesajı sorunu çözüldü. Modal durumu ve hata yönetimi iyileştirildi.
*   **Hata Yönetimi İyileştirmeleri:** Tüm `alert()` kullanımları kaldırıldı, `showCustomToast` ve `modalNote` kullanımına geçildi. Console logları temizlendi. Hata mesajları kullanıcı dostu hale getirildi.
*   **Bilgi Modalları UI/UX Düzeltmeleri:** Tüm bilgi modallarındaki ("Gizlilik Politikası", "Hizmet Sözleşmesi", "Nasıl Kullanılır?", "Hakkında") footer boşluk sorunları düzeltildi. Flexbox yapısı optimize edildi, mobil görünüm iyileştirildi.
*   **Mobil Modal İyileştirmeleri:** Ayarlar ve bilgi modalları için bottom sheet stili ve responsive tasarım iyileştirildi. Footer'lar mobilde de alt boşluksuz görünecek şekilde ayarlandı. Küçük ekranlarda modallar ortalanarak açılıyor ve diğer modallarla aynı genişlikte görüntüleniyor.
*   **Başlık Hiyerarşisi Düzeltmeleri:** Bilgi modallarındaki (Hakkında hariç) başlık boyutları ve hiyerarşisi düzeltildi. Modal başlığı (24px, font-weight: 800) en büyük olacak şekilde ayarlandı. İçerik başlıkları (h3: 18px, h4: 16px, h5: 14px) modal başlığından küçük olacak şekilde düzenlendi. Renk kontrastları ve okunabilirlik iyileştirildi.
*   **Modal Başlık Stilleri:** Modal başlıkları için tutarlı stil (24px, font-weight: 800) uygulandı. İçerik başlıkları için daha iyi margin, line-height ve renk kontrastları eklendi.
*   **Liste ve HR Stilleri:** Bilgi modallarındaki liste (ul/ol) ve ayırıcı çizgi (hr) stilleri iyileştirildi. Daha iyi okunabilirlik için padding ve margin değerleri ayarlandı.
*   **Tailwind CSS Entegrasyonu:** Welcome page ve bazı UI bileşenleri için Tailwind CSS CDN kullanılmaya devam ediliyor. Not: Ana hesap makinesi ve kasa arayüzü hala vanilla CSS kullanmaktadır.
*   **Welcome Page Yeniden Tasarımı:** İlk ziyaretçiler için tam sayfa, modern bir karşılama ekranı tasarlandı. Bu ekran, Tailwind CSS ile oluşturuldu ve uygulamanın özelliklerini görsel olarak tanıtan bir yapıya sahip.
*   **Google Analytics Entegrasyonu:** Kasa oluşturma, silme, giriş, not oluşturma/düzenleme/silme, yedekleme/geri yükleme gibi önemli kullanıcı etkileşimleri için Google Analytics event tracking eklendi.
*   **Sahte Şifre (Honey Password) Özelliği:** Gerçek kasanızı gizlemek için sahte şifre özelliği eklendi. Sahte şifre ile giriş yapıldığında, boş bir kasa gösterilir ve gerçek içeriğiniz gizlenir. Bu özellik, özellikle zorla şifre söyleme durumlarında gerçek verilerinizi korumanıza yardımcı olur. Ayarlar menüsünden sahte şifre belirleme, silme ve yönetme özellikleri eklendi. Sahte şifre ve sahte kasa verileri ayrı localStorage anahtarlarında (`hesapp_aux_key_v1`, `hesapp_aux_data_v1`) saklanır. Gizlilik için genel isimler kullanılır. Eski anahtar adları (`hesapp_honey_password_v1`, `hesapp_honey_vault_v1`) migration desteği ile korunmaktadır.
*   **Open Graph ve Twitter Meta Etiketleri:** Sosyal medya paylaşımları için Open Graph ve Twitter Card meta etiketleri eklendi. Görsel boyutları, açıklamalar ve alt metinler optimize edildi.
*   **Welcome Page İyileştirmeleri:** Welcome page'deki özellik kutularındaki SVG ikon arka planları tema uyumlu hale getirildi. Logo ve başlık boyutları mobil için optimize edildi. Başlık metni "Gizliliğiniz, Tamamen Sizin Kontrolünüzde" olarak güncellendi.

## 3. Sonraki Adımlar
*   Kullanıcı geri bildirimlerine göre ek UI/UX iyileştirmeleri
*   Performans optimizasyonları
*   Erişilebilirlik (accessibility) iyileştirmeleri

## 4. Önemli Çıkarımlar ve Tercihler

*   **Hibrit Yaklaşım:** Proje, ana işlevsellik için vanilla HTML, CSS ve JavaScript kullanmaya devam ederken, welcome page gibi belirli bölümler için Tailwind CSS CDN kullanımına geçilmiştir. Bu hibrit yaklaşım, geliştirme hızını artırırken mevcut kod tabanını korur.
*   **Modüler Mimari:** ES6 modül tabanlı mimari korunmaktadır. Yeni eklenecek tüm işlevsellikler, bu modüler yapıya uygun olarak kendi dosyalarında veya mevcut mantıksal modüller içinde geliştirilmelidir.
*   **Güvenlik Önceliği:** Tüm kriptografik işlemler, tarayıcının yerel Web Crypto API'si kullanılarak ve "sıfır bilgi" prensibine sıkı sıkıya bağlı kalarak yapılmaktadır. Güvenlik ve gizlilikle ilgili her türlü değişiklik bu prensibi korumalıdır.
*   **Kullanıcı Kontrolü:** Otomatik kilitleme süresinin ayarlanabilir yapılması gibi, kullanıcılara uygulama davranışı üzerinde kontrol sağlayan özellikler tercih edilmektedir.
*   **CDN Kullanımı:** Tailwind CSS gibi CDN tabanlı çözümler, build süreci gerektirmediği için projenin "statik dosya" yaklaşımıyla uyumludur. Ancak, bu tür bağımlılıkların kapsamı ve etkisi dikkatle yönetilmelidir.