// Telegram Bot Service

// Send verification code to Telegram bot
async function sendTelegramVerificationCode(userId, username, code) {
    try {
        // Telegram bot'a webhook veya API ile mesaj gönder
        const message = `🔐 Doğrulama Kodu\n\nKullanıcı: @${username}\nKod: ${code}\n\nBu kodu uygulamaya gir.`;
        
        // Gerçek implementasyon için backend gerekli
        // Backend'de bu fonksiyon çağrılacak:
        /*
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: userId,
                text: message,
                parse_mode: 'HTML'
            })
        });
        */
        
        console.log('📱 Telegram verification code sent (simulated)');
        return true;
    } catch (error) {
        console.error('❌ Error sending Telegram message:', error);
        return false;
    }
}

// Open Telegram bot for verification
function openTelegramBot(username) {
    const botUrl = `https://t.me/${TELEGRAM_BOT_USERNAME}?start=verify_${username}`;
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.openTelegramLink(botUrl);
    } else {
        window.open(botUrl, '_blank');
    }
}

// Verify code with backend
async function verifyTelegramCode(userId, code) {
    try {
        // Backend API'ye istek at
        /*
        const response = await fetch('/api/verify-telegram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, code })
        });
        const data = await response.json();
        return data.success;
        */
        
        // Simülasyon
        console.log('✅ Telegram code verified (simulated)');
        return true;
    } catch (error) {
        console.error('❌ Error verifying code:', error);
        return false;
    }
}

// Send notification to user via Telegram
async function sendTelegramNotification(userId, message) {
    try {
        // Backend'den Telegram API'ye mesaj gönder
        console.log('📱 Telegram notification sent:', message);
        return true;
    } catch (error) {
        console.error('❌ Error sending notification:', error);
        return false;
    }
}

// Telegram Bot Webhook Handler (Backend'de çalışacak)
/*
// Node.js + Express örneği:

const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
const app = express();

// Verification codes storage (production'da Redis kullan)
const verificationCodes = new Map();

// Bot commands
bot.onText(/\/start verify_(.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const username = match[1];
    
    bot.sendMessage(chatId, 
        '🔐 Hesap Doğrulama\n\n' +
        'Uygulamadan aldığın 6 haneli kodu buraya gönder.'
    );
});

// Handle verification code
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    
    // Check if it's a 6-digit code
    if (/^\d{6}$/.test(text)) {
        // Generate confirmation code
        const confirmCode = Math.floor(100000 + Math.random() * 900000).toString();
        verificationCodes.set(chatId, confirmCode);
        
        // Save to Firebase
        await db.collection('verifications').add({
            telegramId: chatId,
            verificationCode: text,
            confirmCode: confirmCode,
            status: 'pending',
            createdAt: new Date()
        });
        
        bot.sendMessage(chatId, 
            '✅ Kod alındı!\n\n' +
            `Onay kodu: ${confirmCode}\n\n` +
            'Bu kodu uygulamaya gir.'
        );
    }
});

// API endpoint for verification
app.post('/api/verify-telegram', async (req, res) => {
    const { userId, code } = req.body;
    
    // Check code in Firebase
    const snapshot = await db.collection('verifications')
        .where('confirmCode', '==', code)
        .where('status', '==', 'pending')
        .get();
    
    if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        await doc.ref.update({ status: 'approved' });
        
        // Update user verification status
        await db.collection('users').doc(userId).update({
            verified: true,
            verificationMethod: 'telegram',
            verifiedAt: new Date()
        });
        
        res.json({ success: true });
    } else {
        res.json({ success: false, error: 'Invalid code' });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
*/
