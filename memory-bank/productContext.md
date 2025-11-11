# Product Context: Hesapp

## 1. Çözülen Problem

Günümüz dijital dünyasında, kullanıcıların hem basit araçlara hızlıca erişme ihtiyacı hem de hassas bilgilerini (geçici şifreler, kişisel notlar, fikirler vb.) güvenli bir şekilde saklama gereksinimi vardır. Mevcut çözümler genellikle bu iki ihtiyacı ayrı ayrı karşılar: ya sadece bir hesap makinesi uygulamasıdır ya da karmaşık, bulut tabanlı bir not alma servisidir.
 
Hesapp, bu iki ihtiyacı tek bir minimalist arayüzde birleştirerek şu sorunları çözer:

*   **Güvenlik ve Gizlilik Endişesi:** Kullanıcılar, notlarını bulut servislerine emanet etmek istemeyebilirler. Hesapp, "sıfır bilgi" (zero-knowledge) mimarisiyle verileri yalnızca kullanıcının cihazında şifrelenmiş olarak tutarak bu endişeyi ortadan kaldırır.
*   **Araç Karmaşası:** Basit bir notu güvenle saklamak için ayrı bir uygulama kurma ve yönetme zahmetine katlanmak yerine, Hesapp bunu zaten sık kullanılan bir araç olan hesap makinesinin içine gizler.
*   **Gizli Depolama İhtiyacı:** Uygulama, dışarıdan bakıldığında sadece bir hesap makinesi gibi görünür. Bu, meraklı gözlerden uzak, gizli bir depolama alanı sağlar.
*   **Zorla Şifre Söyleme Durumları:** Kullanıcılar, zorla şifre söylemek zorunda kaldıklarında gerçek verilerini korumak isteyebilirler. Hesapp'in sahte şifre (honey password) özelliği, bu durumlarda gerçek kasanın gizlenmesini sağlar.

## 2. Kullanıcı Deneyimi (UX) Hedefleri

*   **Sezgisel ve Basit:** Uygulamanın ana işlevi olan hesap makinesi, herkesin anında kullanabileceği kadar basit ve tanıdık olmalıdır.
*   **Keşfedilebilir Gizlilik:** Gizli kasanın varlığı, ilk kullanımda kullanıcıya net bir şekilde açıklanmalı (`=` tuşuna 3 kez basma), ancak sonrasında arayüzde dikkat dağıtmamalıdır.
*   **Güven Veren Tasarım:** Güvenlik özellikleri (şifreleme, yerel depolama) kullanıcılara açıkça iletilmelidir. "Gizlilik & Güvenlik" ve "Kullanım Koşulları" gibi bilgilendirme ekranları, uygulamanın şeffaflığını ve güvenilirliğini pekiştirir.
*   **Kesintisiz Akış:** Hesap makinesinden kasaya geçiş ve kasa içindeki işlemler (not oluşturma, yedekleme, geri yükleme) akıcı ve anlaşılır olmalıdır.
*   **Kişiselleştirme:** Açık ve koyu tema seçeneği, kullanıcının görsel tercihlerine ve ortam ışığına uyum sağlayarak daha konforlu bir kullanım sunar.

## 3. Nasıl Çalışmalı?

1.  **Varsayılan Durum (Hesap Makinesi):** Uygulama açıldığında, kullanıcıyı tam işlevli bir hesap makinesi karşılar.
2.  **Gizli Kasanın Tetiklenmesi:** Kullanıcı, `=` (eşittir) tuşuna art arda üç kez basarak gizli kasa modalını tetikler.
3.  **İlk Kurulum:** Kasa daha önce kurulmamışsa, kullanıcıdan yeni bir şifre oluşturması istenir. Bu şifrenin kurtarılamayacağı konusunda net bir uyarı gösterilir.
4.  **Kasa Erişimi:** Kasa kuruluysa, kullanıcıdan şifresini girmesi istenir. Başarılı kimlik doğrulamasının ardından not defteri arayüzü görüntülenir. Eğer girilen şifre gerçek şifre değilse ve sahte şifre belirlenmişse, sahte şifre kontrol edilir. Sahte şifre doğruysa, boş veya sahte notlar içeren bir kasa açılır ve gerçek içerik gizlenir.
5.  **Sahte Şifre Yönetimi:** Kullanıcı, ayarlar menüsünden "Sahte Şifre" seçeneğine tıklayarak sahte şifresini belirleyebilir, değiştirebilir veya silebilir. Sahte şifre, gerçek şifreden farklı olmalıdır ve ayrı bir şifrelenmiş kasa olarak saklanır.
6.  **Veri Yönetimi:** Kullanıcı, kasa içindeyken notlarını düzenleyebilir. Ayrıca, şifrelenmiş verilerini bir dosya olarak dışa aktarabilir (yedekleme), daha önce yedeklediği bir dosyayı içe aktarabilir (geri yükleme) veya tüm kasa verilerini kalıcı olarak silebilir. Sahte şifre ile giriş yapıldığında, yalnızca sahte kasa verileri yönetilebilir.
7.  **Güvenli Çıkış:** Kullanıcı, kasayı kapattığında veya "Çıkış Yap" butonuna bastığında oturum sonlanır ve uygulama tekrar hesap makinesi moduna döner.
8.  **Veri Kalıcılığı:** Tüm şifrelenmiş veriler (gerçek kasa ve sahte kasa), tarayıcının `localStorage` alanında ayrı anahtarlarda saklanır ve oturumlar arasında kalıcılığını korur. Hiçbir veri sunucuya gönderilmez.

Bu bağlam, projenin ürün vizyonunu ve kullanıcı odaklı hedeflerini netleştirmektedir.