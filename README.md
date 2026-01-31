<div align="right">

[Türkçe](#türkçe) | [English](#english)

</div>

<a id="türkçe"></a>

<div align="center">

<img src="favicon/android-chrome-512x512.png" width="96" height="96" alt="Hesapp Logo">

# Hesapp

**Hesap Makinesi & Gizli Kasa**

[![Sürüm](https://img.shields.io/badge/sürüm-v1.3.99-blue?style=flat-square)](https://huseyinacikgoz.com.tr/hesapp/)
[![Lisans](https://img.shields.io/badge/lisans-MIT-green?style=flat-square)](LICENSE)
[![PWA](https://img.shields.io/badge/PWA-aktif-orange?style=flat-square)](https://huseyinacikgoz.com.tr/hesapp/)
[![Durum](https://img.shields.io/badge/durum-Yayında-success?style=flat-square)](https://huseyinacikgoz.com.tr/hesapp/)

</div>

### 📖 Hakkında

**Hesapp**, standart bir hesap makinesi işlevselliğini, güçlü şifreleme ile korunan kişisel bir not kasasıyla birleştiren minimalist bir web uygulamasıdır.

Uygulama, basit bir hesap makinesi arayüzünün ardında, notlarınızı güvende tutan şifreli bir kasa gizler. Verileriniz, yalnızca sizin bildiğiniz bir parola ile cihazınızda şifrelenir ve **asla internete gönderilmez**.

### ✨ Özellikler

#### 🧮 Hesap Makinesi
- Temel aritmetik işlemler (toplama, çıkarma, çarpma, bölme)
- Yüzde hesaplama ve sonuç kopyalama
- Temiz, minimalist arayüz ve klavye desteği

#### 🔒 Gizli Kasa
- **Güçlü Şifreleme**: AES-GCM şifreleme algoritması
- **Anahtar Türetme**: PBKDF2 (600.000 iterasyon)
- **Zero-Knowledge**: Verileriniz yalnızca cihazınızda saklanır
- **Sahte Parola (Honey Password)**: Gerçek kasanızı gizlemek için sahte parola
- **Favori Notlar**: Önemli notları favorilere ekleyin
- **Yedekleme & Geri Yükleme**: Şifreli yedekleme
- **Otomatik Kilitleme**: Ayarlanabilir süre
- **Çöp Kutusu**: Silinen notları geri yükleyin

#### 🎨 Kullanıcı Deneyimi
- **PWA Desteği**: Ana ekrana ekleyin, çevrimdışı kullanın
- **Açık/Koyu Tema**: Sistem temasına uyum veya manuel seçim
- **Responsive Tasarım**: Tüm cihazlarda mükemmel görünüm
- **Gizli Tetikleme**: `=` tuşuna 3 kez basarak kasayı açın

### 🛡️ Güvenlik ve Gizlilik

- Notlarınız **AES-GCM** ile şifrelenir
- Şifreleme anahtarı **PBKDF2 (600.000 iterasyon)** ile türetilir
- Verileriniz **asla sunucuya gönderilmez**
- **Google Analytics kullanmıyoruz** - Self-hosted Umami Analytics

> ⚠️ **Önemli**: Parolanızı unutmanız durumunda verilerinize erişim kalıcı olarak kaybolur.

### 🚀 Kullanım

#### Canlı Versiyon
🌐 [huseyinacikgoz.com.tr/hesapp](https://huseyinacikgoz.com.tr/hesapp/)

#### Yerel Kurulum

```bash
# Depoyu klonlayın
git clone https://github.com/huseyinacikgoz/hesapp.git
cd hesapp

# Yerel sunucu başlatın
python3 -m http.server 8080
# veya
npx http-server -p 8080

# Tarayıcıda açın: http://localhost:8080
```

### 🛠️ Teknolojiler
- **Vanilla JavaScript** (ES6 Modules)
- **HTML5** & **CSS3**
- **Web Crypto API** (Şifreleme)
- **Service Worker** (PWA)
- **LocalStorage** (Veri depolama)
- **Tailwind CSS** (Welcome page)

### 📝 Lisans
Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.

### 👨‍💻 Geliştirici
**Hüseyin Açıkgöz**

- 🌐 Website: [huseyinacikgoz.com.tr](https://huseyinacikgoz.com.tr)
- 📧 Email: [mail@huseyinacikgoz.com.tr](mailto:mail@huseyinacikgoz.com.tr)
- 🐦 Twitter/X: [@huseyinacikgoz_](https://x.com/huseyinacikgoz_)
- 💻 GitHub: [@huseyinacikgoz](https://github.com/huseyinacikgoz)

### 🤝 Katkıda Bulunma
1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

### 📊 Versiyon
**v1.3.99** - Güncel sürüm

### 🔗 Bağlantılar
- [🌐 Canlı Demo](https://huseyinacikgoz.com.tr/hesapp/)
- [💻 GitHub Repo](https://github.com/huseyinacikgoz/hesapp)
- [📧 İletişim](mailto:mail@huseyinacikgoz.com.tr)
- [🐦 Twitter/X](https://x.com/huseyinacikgoz_)

---

<a id="english"></a>

<div align="center">

<img src="favicon/android-chrome-512x512.png" width="96" height="96" alt="Hesapp Logo">

# Hesapp

**Calculator & Secret Vault**

[![Version](https://img.shields.io/badge/version-v1.3.99-blue?style=flat-square)](https://huseyinacikgoz.com.tr/hesapp/)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![PWA](https://img.shields.io/badge/PWA-enabled-orange?style=flat-square)](https://huseyinacikgoz.com.tr/hesapp/)
[![Status](https://img.shields.io/badge/status-Live-success?style=flat-square)](https://huseyinacikgoz.com.tr/hesapp/)

</div>

### 📖 About

**Hesapp** is a minimalist web application that combines standard calculator functionality with a personal note vault protected by strong encryption.

The app hides an encrypted vault behind a simple calculator interface, keeping your notes safe. Your data is encrypted on your device with a password only you know and is **never sent to the internet**.

### ✨ Features

#### 🧮 Calculator
- Basic arithmetic operations (add, subtract, multiply, divide)
- Percentage calculation and result copying
- Clean, minimalist interface with keyboard support

#### 🔒 Secret Vault
- **Strong Encryption**: AES-GCM encryption algorithm
- **Key Derivation**: PBKDF2 (600,000 iterations)
- **Zero-Knowledge**: Your data is stored only on your device
- **Honey Password**: Decoy password to hide your real vault
- **Favorite Notes**: Mark important notes as favorites
- **Backup & Restore**: Encrypted backup support
- **Auto-Lock**: Configurable timeout
- **Trash Bin**: Recover deleted notes

#### 🎨 User Experience
- **PWA Support**: Add to home screen, use offline
- **Light/Dark Theme**: System preference or manual selection
- **Responsive Design**: Perfect display on all devices
- **Hidden Trigger**: Press `=` key 3 times to open the vault

### 🛡️ Security & Privacy

- Notes are encrypted with **AES-GCM**
- Encryption key derived using **PBKDF2 (600,000 iterations)**
- Your data is **never sent to any server**
- **No Google Analytics** - Self-hosted Umami Analytics only

> ⚠️ **Important**: If you forget your password, access to your data is permanently lost.

### 🚀 Getting Started

#### Live Version
🌐 [huseyinacikgoz.com.tr/hesapp](https://huseyinacikgoz.com.tr/hesapp/)

#### Local Installation

```bash
# Clone the repository
git clone https://github.com/huseyinacikgoz/hesapp.git
cd hesapp

# Start a local server
python3 -m http.server 8080
# or
npx http-server -p 8080

# Open in browser: http://localhost:8080
```

### 🛠️ Technologies
- **Vanilla JavaScript** (ES6 Modules)
- **HTML5** & **CSS3**
- **Web Crypto API** (Encryption)
- **Service Worker** (PWA)
- **LocalStorage** (Data storage)
- **Tailwind CSS** (Welcome page)

### 📝 License
This project is licensed under the [MIT License](LICENSE).

### 👨‍💻 Developer
**Hüseyin Açıkgöz**

- 🌐 Website: [huseyinacikgoz.com.tr](https://huseyinacikgoz.com.tr)
- 📧 Email: [mail@huseyinacikgoz.com.tr](mailto:mail@huseyinacikgoz.com.tr)
- 🐦 Twitter/X: [@huseyinacikgoz_](https://x.com/huseyinacikgoz_)
- 💻 GitHub: [@huseyinacikgoz](https://github.com/huseyinacikgoz)

### 🤝 Contributing
1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push your branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### 📊 Version
**v1.3.99** - Current version

### 🔗 Links
- [🌐 Live Demo](https://huseyinacikgoz.com.tr/hesapp/)
- [💻 GitHub Repo](https://github.com/huseyinacikgoz/hesapp)
- [📧 Contact](mailto:mail@huseyinacikgoz.com.tr)
- [🐦 Twitter/X](https://x.com/huseyinacikgoz_)

---

<div align="center">

**⭐ Don't forget to star if you like it! ⭐**

Made with ❤️ by [Hüseyin Açıkgöz](https://huseyinacikgoz.com.tr)

</div>
