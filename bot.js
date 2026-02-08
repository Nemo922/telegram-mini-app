// Telegram Bot - Node.js
// npm install node-telegram-bot-api express

const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const path = require('path');

// Bot token'ınızı buraya yazın
const BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE';
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Web App URL'iniz (GitHub Pages veya hosting)
const WEB_APP_URL = 'https://yourusername.github.io/telegram-mini-shop/';

// Express server (mini app dosyalarını serve etmek için)
const app = express();
app.use(express.static(path.join(__dirname)));

// /start komutu
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name;
    
    const welcomeMessage = `
🎮 Hoş geldin ${firstName}!

CoinDrop'a hoş geldin! Coin topla, görevleri tamamla ve arkadaşlarını davet et!

🪙 Tıkla ve kazan
⚡ Güçlendirmeler
📋 Görevler
👥 Arkadaşlarını davet et

Hemen başlamak için aşağıdaki butona tıkla!
    `;
    
    const keyboard = {
        inline_keyboard: [
            [
                {
                    text: '🎮 Oyunu Başlat',
                    web_app: { url: WEB_APP_URL }
                }
            ],
            [
                { text: '📊 İstatistikler', callback_data: 'stats' },
                { text: '❓ Yardım', callback_data: 'help' }
            ]
        ]
    };
    
    bot.sendMessage(chatId, welcomeMessage, {
        reply_markup: keyboard,
        parse_mode: 'HTML'
    });
});

// Callback query handler
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;
    
    if (data === 'stats') {
        bot.sendMessage(chatId, '📊 İstatistikleriniz yükleniyor...');
    } else if (data === 'help') {
        const helpText = `
❓ Nasıl Oynanır?

1️⃣ Oyunu başlat butonuna tıkla
2️⃣ Büyük coin butonuna tıklayarak coin topla
3️⃣ Görevleri tamamla ve bonus kazan
4️⃣ Güçlendirmeler satın al
5️⃣ Arkadaşlarını davet et ve ödül kazan

Her tıklama = Coin kazanırsın!
Enerjin biterse biraz bekle, otomatik yenilenir.
        `;
        bot.sendMessage(chatId, helpText);
    }
    
    bot.answerCallbackQuery(query.id);
});

// Referral sistemi
bot.onText(/\/start ref_(.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const referrerId = match[1];
    
    // Referral kaydı yapılabilir (database'e kaydet)
    console.log(`Yeni kullanıcı: ${chatId}, Davet eden: ${referrerId}`);
    
    bot.sendMessage(chatId, '🎉 Referans linki ile katıldın! Bonus kazandın!');
});

// Web data handler
bot.on('web_app_data', (msg) => {
    const chatId = msg.chat.id;
    const data = JSON.parse(msg.web_app_data.data);
    
    console.log('Web App Data:', data);
    
    // Sipariş veya oyun verisi işle
    if (data.action === 'order') {
        bot.sendMessage(chatId, `✅ Siparişin alındı! Toplam: ${data.total} ₺`);
    }
});

// Server başlat
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server çalışıyor: http://localhost:${PORT}`);
    console.log(`🤖 Bot çalışıyor...`);
});
