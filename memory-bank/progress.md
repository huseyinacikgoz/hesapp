# Project Progress

## Status: v1.3.99 Released (29 Ocak 2026)

### v1.3.99 Değişiklikleri

#### Gizlilik & Güvenlik
- [x] **Degoogle:** Google Analytics tamamen kaldırıldı
- [x] **Umami Analytics:** Self-hosted, gizlilik dostu analytics eklendi
- [x] **Güvenlik:**
    - [x] `.gitignore` oluşturuldu (hassas dosyalar hariç tutuldu)
    - [x] `.env` dosyası oluşturuldu
    - [x] `.env.example` şablon eklendi
    - [x] `SECURITY_REPORT.md` güncellendi ve .gitignore'a eklendi

#### UI/UX Güncellemeleri
- [x] **Fiyatlandırma Bölümü Yeniden Tasarlandı:**
    - [x] Başlık "Tamamen Ücretsiz" + "%100 ÜCRETSİZ" rozeti
    - [x] "Ücretsiz" kartı: yeşil border, "TAM ERİŞİM" rozeti
    - [x] "Geliştiriciye Destek" kartı: Kreosus linki, "🚀 Destekle" CTA butonu
    - [x] Profesyonel emojiler: 🚀, ✨, 🛡️ (kalpler kaldırıldı)
- [x] **Hamburger Menü Güncellendi:**
    - [x] "Ücretlendirme" → "Destek Ol"
    - [x] "Ekibimiz" → "Geliştirici"
- [x] **Geliştirici Bölümü Sadeleştirildi:**
    - [x] Sadece "Hüseyin Açıkgöz" (Full-Stack Geliştirici kaldırıldı)
    - [x] Sosyal linkler: Website, Email, GitHub, LinkedIn, X
    - [x] Gemini ve Cursor AI kartları kaldırıldı
- [x] **Scroll Offset Optimize Edildi:** Section padding'leri azaltıldı
- [x] **Footer:** 2025 → 2026
- [x] **Gizlilik Politikası:** Son güncelleme tarihi 29.01.2026
- [x] **Versiyon Güncellemesi:** Tüm dosyalarda v1.3.99

### Implemented Features (v1.3.98)
- [x] **Appearance Settings UI Overhaul:**
    - Replaced toggle with side-by-side card layout for "Home Page" vs "Calculator" startup selection.
    - Added SVG icons and theme-aware styling.
- [x] **Bug Fixes:**
    - Fixed Vault UI state mismatch (Trash/Favorites filter logic).
    - Fixed `hideModal` crash (null reference).
    - Added external link icon to GitHub link in About modal.
    - Fixed "Report Bug" button not opening email client.
- [x] **Mobile UX:**
    - Implemented swipe gestures (Left to Delete, Right to Favorite) for note items.
- [x] **Trash Bin Logic:** Implement "Trash Bin" feature (soft delete).
- [x] **Open Source:** GitHub repository ve açık kaynak lisansı eklendi.

### In Progress
- [ ] **Tagging System:** Add tags to notes and filter by them.
- [ ] **Biometric Login (WebAuthn):** Future implementation.

### Previous Releases
- **v1.3.98:** UI improvements, bug fixes, open source support.
- **v1.3.97:** Code modularization, button fixes.
- **v1.3.96:** Version consistency update.
- **v1.3.95:** Trash Bin improvements, UI fixes.
- **v1.3.94:** Honey Password, Security Fixes.

## 3. Bilinen Sorunlar
*   Şu anda bilinen kritik sorun bulunmamaktadır.

## 4. Yayın Hazırlık Durumu
*   **Durum:** ✅ **Yayında**
*   **Güvenlik:** Tüm kritik güvenlik açıkları düzeltildi. XSS koruması aktif. Şifreleme güçlü (AES-GCM + PBKDF2 600K iterasyon).
*   **Gizlilik:** Google Analytics kaldırıldı, self-hosted Umami Analytics kullanılıyor.
*   **Kod Kalitesi:** Lint hataları yok. Versiyon tutarlılığı (v1.3.99). Modüler mimari.