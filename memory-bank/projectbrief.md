# Project Brief: Hesapp

## 1. Proje Adı
Hesapp

## 2. Kısa Tanım
Hesapp, standart bir hesap makinesi işlevselliğini, güçlü şifreleme ile korunan kişisel bir not kasasıyla birleştiren minimalist bir web uygulamasıdır. Kullanıcı verileri yalnızca cihazda saklanır ve "sıfır bilgi" prensibiyle maksimum güvenlik sağlanır.
 
## 3. Temel Amaç ve Hedefler
*   Kullanıcılara basit ve etkili bir hesap makinesi deneyimi sunmak.
*   Hesap makinesi arayüzünün ardında, kişisel notları güvenli bir şekilde saklayabilecekleri şifreli bir kasa sağlamak.
*   Veri güvenliğini ve gizliliğini en üst düzeyde tutmak (zero-knowledge, cihazda depolama, güçlü şifreleme).
*   Kullanıcı dostu bir arayüz ve deneyim sunmak.
*   Tema değiştirme (açık/koyu mod) gibi kişiselleştirme seçenekleri sunmak.

## 4. Temel Özellikler
*   **Hesap Makinesi Fonksiyonları:** Temel aritmetik işlemler (toplama, çıkarma, çarpma, bölme), yüzde, geri alma (backspace), temizleme (clear).
*   **Gizli Kasa:**
    *   Şifre korumalı not depolama.
    *   AES-GCM şifreleme ve PBKDF2 (600.000 iterasyon) ile anahtar türetme.
    *   Brute-force saldırılarına karşı koruma (artan bekleme süreleri).
    *   Ayarlanabilir otomatik kilitleme süresi.
    *   Verilerin yalnızca kullanıcının cihazında saklanması (zero-knowledge).
    *   Veri yedekleme (export) ve geri yükleme (import) yeteneği.
    *   Kasa verilerini silme seçeneği.
*   **Kullanıcı Arayüzü:**
    *   Duyarlı tasarım (responsive design).
    *   Açık ve koyu tema desteği (localStorage ve `prefers-color-scheme` ile).
    *   Sonuç kopyalama özelliği.
    *   Bilgilendirme modalları (Gizlilik & Güvenlik, Kullanım Koşulları, Hakkında, Hoş Geldiniz, Nasıl Kullanılır?).