# 🚀 PUBG Marketplace - Kurulum Rehberi

## 📋 Gereksinimler

- Node.js 18+ 
- npm veya yarn
- Firebase hesabı
- Telegram Bot
- Stripe hesabı

## 1️⃣ Firebase Kurulumu

### Adım 1: Firebase Projesi Oluştur
1. https://console.firebase.google.com/ git
2. "Add project" tıkla
3. Proje adı: `pubg-marketplace`
4. Google Analytics: İsteğe bağlı (önerilir)
5. Projeyi oluştur

### Adım 2: Firestore Database Oluştur
1. Sol menüden "Firestore Database" seç
2. "Create database" tıkla
3. "Start in production mode" seç
4. Location seç (europe-west1 önerilir)
5. "Enable" tıkla

### Adım 3: Web App Ekle
1. Project Settings → General
2. "Your apps" bölümünde Web ikonu (</>)  tıkla
3. App nickname: "PUBG Marketplace Web"
4. Firebase Hosting: İsteğe bağlı
5. "Register app" tıkla
6. Firebase config'i kopyala

### Adım 4: Config Dosyasını Güncelle
`config.js` dosyasını aç ve Firebase config'i yapıştır:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSy...",
    authDomain: "pubg-marketplace.firebaseapp.com",
    projectId: "pubg-marketplace",
    storageBucket: "pubg-marketplace.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123"
};
```

### Adım 5: Service Account Key (Backend için)
1. Project Settings → Service accounts
2. "Generate new private key" tıkla
3. `serviceAccountKey.json` olarak kaydet
4. Bu dosyayı backend klasörüne koy
5. **ÖNEMLİ:** `.gitignore`'a ekle!

## 2️⃣ Telegram Bot Kurulumu

### Adım 1: Bot Oluştur
1. Telegram'da @BotFather'ı aç
2. `/newbot` komutunu gönder
3. Bot adı: `PUBG Market Verification Bot`
4. Username: `pubgmarket_verify_bot` (benzersiz olmalı)
5. Token'ı kopyala (örn: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

### Adım 2: Bot Ayarları
```
/setdescription - Bot açıklaması ekle
/setabouttext - Hakkında metni ekle
/setuserpic - Bot profil fotoğrafı ekle
```

### Adım 3: Config Güncelle
`config.js` dosyasında:

```javascript
const TELEGRAM_BOT_TOKEN = "1234567890:ABCdefGHIjklMNOpqrsTUVwxyz";
const TELEGRAM_BOT_USERNAME = "pubgmarket_verify_bot";
```

### Adım 4: Telegram ID'ni Bul
1. @userinfobot'u aç
2. Mesaj gönder
3. ID'ni kopyala
4. `config.js`'de `ADMIN_TELEGRAM_ID` güncelle

## 3️⃣ Stripe Kurulumu

### Adım 1: Hesap Oluştur
1. https://dashboard.stripe.com/register git
2. Hesap oluştur
3. E-posta doğrula

### Adım 2: API Keys Al
1. Developers → API keys
2. **Publishable key** kopyala (pk_test_...)
3. **Secret key** kopyala (sk_test_...)

### Adım 3: Config Güncelle
`config.js` dosyasında:

```javascript
const STRIPE_PUBLISHABLE_KEY = "pk_test_...";
```

`.env` dosyasında (backend için):

```
STRIPE_SECRET_KEY=sk_test_...
```

### Adım 4: Webhook Ayarla
1. Developers → Webhooks
2. "Add endpoint" tıkla
3. Endpoint URL: `https://yourdomain.com/webhook`
4. Events: `payment_intent.succeeded`
5. Webhook secret'ı kopyala
6. `.env`'ye ekle: `STRIPE_WEBHOOK_SECRET=whsec_...`

## 4️⃣ Backend Kurulumu

### Adım 1: Dependencies Yükle
```bash
cd backend
npm install
```

### Adım 2: .env Dosyası Oluştur
```bash
# .env
PORT=3000
TELEGRAM_BOT_TOKEN=your_bot_token
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NODE_ENV=development
```

### Adım 3: Server'ı Başlat
```bash
# Development
npm run dev

# Production
npm start
```

## 5️⃣ Frontend Kurulumu

### Adım 1: Config Kontrol
`config.js` dosyasındaki tüm değerlerin dolu olduğundan emin ol.

### Adım 2: Test Et
```bash
# Basit HTTP server
python -m http.server 8000

# Veya
npx serve
```

Tarayıcıda aç: http://localhost:8000

## 6️⃣ Deploy (Yayınlama)

### Frontend - GitHub Pages
```bash
git add .
git commit -m "Add integrations"
git push origin main
```

### Backend - Heroku
```bash
# Heroku CLI yükle
npm install -g heroku

# Login
heroku login

# App oluştur
heroku create pubg-marketplace-api

# Environment variables ekle
heroku config:set TELEGRAM_BOT_TOKEN=your_token
heroku config:set STRIPE_SECRET_KEY=your_key
heroku config:set STRIPE_WEBHOOK_SECRET=your_secret

# Deploy
git push heroku main
```

### Backend - Vercel
```bash
# Vercel CLI yükle
npm install -g vercel

# Deploy
vercel

# Environment variables ekle (Vercel dashboard'dan)
```

## 7️⃣ Test Etme

### Telegram Bot Test
1. Telegram'da botunu aç
2. `/start verify_testuser` gönder
3. 6 haneli kod gönder
4. Onay kodu al

### Stripe Test
Test kartları:
- Başarılı: `4242 4242 4242 4242`
- CVV: Herhangi 3 rakam
- Tarih: Gelecek bir tarih

### Firebase Test
1. Firebase Console → Firestore
2. Collections'ı kontrol et:
   - users
   - accounts
   - verifications
   - notifications

## 🔧 Sorun Giderme

### Firebase Bağlantı Hatası
- API key'i kontrol et
- Firestore rules'ı kontrol et
- Console'da hata mesajlarını oku

### Telegram Bot Çalışmıyor
- Token'ı kontrol et
- Bot'un aktif olduğundan emin ol
- Webhook yerine polling kullan (development için)

### Stripe Ödeme Başarısız
- Test mode'da olduğundan emin ol
- Test kartlarını kullan
- Webhook'un çalıştığını kontrol et

## 📚 Daha Fazla Bilgi

- [Firebase Docs](https://firebase.google.com/docs)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Stripe Docs](https://stripe.com/docs)

## 🆘 Destek

Sorun yaşıyorsan:
1. Console'daki hataları kontrol et
2. Network sekmesini incele
3. Backend loglarını oku
4. GitHub Issues'da sor
