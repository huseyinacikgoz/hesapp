# Active Context: Hesapp

## 1. Mevcut Odak
`v1.3.99` sürümü yayınlandı. Bu sürümde Google Analytics kaldırılarak gizlilik iyileştirildi, Umami Analytics eklendi, UI/UX güncellemeleri yapıldı ve açık kaynak güvenliği artırıldı.
 
## 2. Son Değişiklikler

### v1.3.99 (Güncel) - 29 Ocak 2026

#### Gizlilik & Güvenlik
*   **Degoogle:** Google Analytics (gtag.js) tamamen kaldırıldı. Kullanıcı gizliliği artırıldı.
*   **Umami Analytics:** Self-hosted, gizlilik dostu Umami Analytics eklendi. GDPR uyumlu, çerez kullanmıyor.
*   **Güvenlik İyileştirmeleri:**
    - `.gitignore` dosyası oluşturuldu/güncellendi
    - `.env` dosyası oluşturuldu (hassas bilgiler için)
    - `.env.example` şablon dosyası eklendi
    - Hassas dosyalar Git'ten hariç tutuldu: `.env`, `AGENTS.md`, `memory-bank/`, `.htaccess`, `SECURITY_REPORT.md`
*   **SECURITY_REPORT.md:** v1.3.99 güncellemesiyle birlikte gizlilik iyileştirmeleri belgelendi.

#### UI/UX Güncellemeleri
*   **Fiyatlandırma Bölümü Yeniden Tasarlandı:**
    - Başlık "Tamamen Ücretsiz" olarak değiştirildi
    - "%100 ÜCRETSİZ" rozeti eklendi
    - "Ücretsiz" kartı yeşil borderlı ve "TAM ERİŞİM" rozetli
    - "Geliştiriciye Destek" kartı: Kreosus linki ve CTA butonu eklendi
    - Profesyonel emojiler: 🚀 (roket), ✨ (sparkle), 🛡️ (kalkan)
*   **Hamburger Menü Güncellendi:**
    - "Ücretlendirme" → "Destek Ol" (volunteer_activism ikonu)
    - "Ekibimiz" → "Geliştirici" (person ikonu)
*   **Geliştirici Bölümü Sadeleştirildi:**
    - Sadece "Hüseyin Açıkgöz" ismi (Full-Stack Geliştirici kaldırıldı)
    - Sosyal linkler eklendi: Website, Email, GitHub, LinkedIn, X (Twitter)
    - Gemini ve Cursor AI kartları kaldırıldı
*   **Scroll Offset Optimize Edildi:** Section padding'leri azaltılarak menüden tıklandığında başlıkların sayfanın üstünde görünmesi sağlandı.
*   **Footer:** Telif hakkı yılı 2025 → 2026 olarak güncellendi.
*   **Gizlilik Politikası:** Son güncelleme tarihi 29.01.2026 olarak güncellendi.

### v1.3.98
*   **Görünüm Ayarları UI Yenilemesi:** "Başlangıçta karşılama ekranını gizle" seçeneği, daha anlaşılır ve görsel bir yapıya kavuşturuldu.
*   **Hakkında Modalı İyileştirmesi:** GitHub linkinin yanına dış bağlantı ikonu eklendi.
*   **Kasa UI Hata Düzeltmeleri:** Filtre durumu ve hideModal hataları düzeltildi.
*   **Splash Screen Hatası Düzeltildi (KRİTİK)**
*   **Çöp Kutusu Özelliği:** Notlar için kapsamlı çöp kutusu sistemi eklendi.
*   **Açık Kaynak Desteği:** GitHub repository eklendi.

## 3. Sonraki Adımlar
*   Kullanıcı geri bildirimlerine göre ek UI/UX iyileştirmeleri
*   Performans optimizasyonları
*   Erişilebilirlik (accessibility) iyileştirmeleri
*   **Tagging System:** Notlara etiket ekleme ve filtreleme özelliği

## 4. Önemli Çıkarımlar ve Tercihler

*   **Gizlilik Önceliği:** Google Analytics kaldırılarak self-hosted Umami Analytics'e geçildi. Kullanıcı verileri üçüncü taraflara gönderilmiyor.
*   **Hibrit Yaklaşım:** Proje, ana işlevsellik için vanilla HTML, CSS ve JavaScript kullanmaya devam ederken, welcome page için Tailwind CSS CDN kullanılıyor.
*   **Modüler Mimari:** ES6 modül tabanlı mimari korunmaktadır.
*   **Güvenlik Önceliği:** Tüm kriptografik işlemler, tarayıcının yerel Web Crypto API'si kullanılarak yapılmaktadır.
*   **Zero-Knowledge Prensibi:** Veriler yalnızca cihazda saklanıyor, sunucuya gönderilmiyor.

## Current Version: v1.3.99