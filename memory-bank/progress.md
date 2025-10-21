# Progress: Hesapp

## 1. Neler Çalışıyor? (Mevcut Durum)

*   **Hesap Makinesi:** Tüm temel aritmetik işlemler (+, -, *, /), yüzde (%), geri al (backspace) ve temizle (C) fonksiyonları beklendiği gibi çalışmaktadır.
*   **Gizli Kasa:**
    *   `=` tuşuna 3 kez basarak kasa arayüzü tetiklenebiliyor.
    *   İlk kurulumda şifre oluşturma ve sonraki girişlerde şifre ile doğrulama sorunsuz çalışıyor.
    *   Notlar, AES-GCM ile güvenli bir şekilde şifrelenip `localStorage`'da saklanıyor.
    *   **Brute-Force Koruması:** Art arda yapılan hatalı şifre denemeleri, artan bekleme süreleriyle (1, 3, 5 dk) engelleniyor.
    *   **Otomatik Kilitleme:** Kasa, kullanıcı tarafından ayarlanabilen bir süre (1, 3, 5, 10 dk veya asla) işlem yapılmadığında otomatik olarak kilitleniyor.
    *   Verileri yedekleme (export), geri yükleme (import) ve kasayı tamamen silme özellikleri işlevseldir.
*   **Kullanıcı Arayüzü:**
    *   Açık ve koyu tema arasında geçiş yapılabiliyor ve tercih `localStorage`'da saklanıyor.
    *   Hoş geldiniz, gizlilik, kullanım koşulları ve hakkında gibi tüm bilgilendirme modalları çalışıyor.
    *   **"Nasıl Kullanılır?" Modalı:** Kasanın özelliklerini açıklayan, tema uyumlu ve kaydırılabilir bir yardım modalı eklendi. Bu modala hem hoş geldiniz ekranından hem de kasa içindeki bilgi menüsünden erişilebiliyor.
    *   Arayüz, mobil ve masaüstü cihazlar için duyarlı (responsive) bir tasarıma sahiptir.

## 2. Neler Eksik veya Geliştirilebilir?
Aşağıdaki özelliklerin sırayla eklenmesi planlanmaktadır:

1.  **Sürüm Güncellemede Önbellek Temizliği:** Yeni sürümlerde, kullanıcının kasa verilerine zarar vermeden sadece CSS/JS gibi statik dosyaların tarayıcı önbelleğinden temizlenmesini sağlayan bir mekanizma.

## 3. Bilinen Sorunlar

*   Mevcut kod tabanında bilinen bir hata veya sorun tespit edilmemiştir.