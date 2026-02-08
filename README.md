# CoinDrop - Telegram Mini App

Telegram için tap-to-earn/airdrop tarzı mini uygulama.

## 🚀 Kurulum

### 1. Bot Oluşturma

1. Telegram'da @BotFather'ı aç
2. `/newbot` komutunu gönder
3. Bot adı ve username belirle
4. Bot token'ını kaydet

### 2. Mini App Ekleme

1. @BotFather'da `/newapp` komutunu gönder
2. Botunu seç
3. App adı: `CoinDrop`
4. Açıklama: `Tap to earn coins!`
5. Fotoğraf yükle (512x512 PNG)
6. GIF yükle (isteğe bağlı)
7. Web App URL: GitHub Pages URL'ini gir

### 3. GitHub Pages'e Yükleme

```bash
# Git yükle ve repo oluştur
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main

# GitHub'da Settings > Pages > Source: main branch
```

### 4. Bot Çalıştırma (Opsiyonel)

```bash
# Bağımlılıkları yükle
npm install

# Bot token'ı düzenle
# bot.js dosyasında BOT_TOKEN ve WEB_APP_URL'i güncelle

# Botu başlat
npm start
```

## 📱 Kullanım

1. Telegram'da botunuzu açın
2. `/start` komutunu gönderin
3. "🎮 Oyunu Başlat" butonuna tıklayın
4. Coin toplamaya başlayın!

## 🎮 Özellikler

- 🪙 Tap to earn sistemi
- ⚡ Enerji sistemi (otomatik yenilenir)
- 📋 Görevler ve ödüller
- 🚀 Güçlendirmeler
- 👥 Referans sistemi
- 💾 LocalStorage ile kayıt
- 📳 Haptic feedback

## 🛠️ Teknolojiler

- HTML5, CSS3, JavaScript
- Telegram Web App API
- Node.js + Express (bot için)
- node-telegram-bot-api

## 📝 Yapılacaklar

- [ ] Backend API entegrasyonu
- [ ] Database (MongoDB/PostgreSQL)
- [ ] Liderlik tablosu
- [ ] Günlük görevler
- [ ] NFT/Token entegrasyonu
- [ ] Ödeme sistemi

## 🔧 Özelleştirme

### Görevleri Düzenleme
`app.js` dosyasında `tasks` dizisini düzenleyin:

```javascript
const tasks = [
    { id: 1, icon: '📱', title: 'Kanalına Katıl', reward: 5000, link: 'https://t.me/yourchannel' }
];
```

### Güçlendirmeleri Düzenleme
`app.js` dosyasında `boosts` dizisini düzenleyin.

### Renkleri Değiştirme
`style.css` dosyasında gradient renklerini değiştirin.

## 📞 Destek

Sorularınız için: [Telegram](https://t.me/yourusername)

## 📄 Lisans

MIT
