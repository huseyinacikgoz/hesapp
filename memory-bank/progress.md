# Progress: Hesapp

## 1. Neler Çalışıyor? (Mevcut Durum)

Uygulamanın v1.2.0 olarak etiketlenen mevcut sürümü, temel özellik setiyle tamamen işlevseldir.

*   **Hesap Makinesi:** Tüm temel aritmetik işlemler (+, -, *, /), yüzde (%), geri al (backspace) ve temizle (C) fonksiyonları beklendiği gibi çalışmaktadır.
*   **Gizli Kasa:**
    *   `=` tuşuna 3 kez basarak kasa arayüzü tetiklenebiliyor.
    *   İlk kurulumda şifre oluşturma ve sonraki girişlerde şifre ile doğrulama sorunsuz çalışıyor.
    *   Notlar, AES-GCM ile güvenli bir şekilde şifrelenip `localStorage`'da saklanıyor.
    *   Verileri yedekleme (export), geri yükleme (import) ve kasayı tamamen silme özellikleri işlevseldir.
*   **Kullanıcı Arayüzü:**
    *   Açık ve koyu tema arasında geçiş yapılabiliyor ve tercih `localStorage`'da saklanıyor.
    *   Hoş geldiniz, gizlilik, kullanım koşulları ve hakkında gibi tüm bilgilendirme modalları çalışıyor.
    *   Arayüz, mobil ve masaüstü cihazlar için duyarlı (responsive) bir tasarıma sahiptir.

## 2. Neler Eksik veya Geliştirilebilir?
Aşağıdaki özelliklerin sırayla eklenmesi planlanmaktadır:

1.  **Otomatik Kilitleme:** Belirli bir süre işlem yapılmadığında kasanın otomatik olarak kilitlenmesi.
2.  **"Nasıl Kullanılır" Modalı:** Kasanın kullanımı hakkında detaylı bilgi veren bir yardım ekranı ve bu ekrana yönlendiren linklerin eklenmesi.
3.  **Brute-Force Koruması:** Hatalı şifre denemelerinde artan bekleme süreleri (3 denemede 1 dk, sonraki 3'te 3 dk, sonraki 3'te 5 dk).
4.  **Sürüm Güncellemede Önbellek Temizliği:** Yeni sürümlerde, kullanıcının kasa verilerine zarar vermeden sadece CSS/JS gibi statik dosyaların tarayıcı önbelleğinden temizlenmesini sağlayan bir mekanizma.

## 3. Bilinen Sorunlar

*   Mevcut kod tabanında bilinen bir hata veya sorun tespit edilmemiştir.