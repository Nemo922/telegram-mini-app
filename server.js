// Backend Server (Node.js + Express)
// Bu dosyayı çalıştırmak için: node server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy');
const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin (sadece serviceAccountKey.json varsa)
let db = null;
if (fs.existsSync('./serviceAccountKey.json')) {
    admin.initializeApp({
        credential: admin.credential.cert(require('./serviceAccountKey.json'))
    });
    db = admin.firestore();
    console.log('✅ Firebase Admin initialized');
} else {
    console.warn('⚠️ serviceAccountKey.json not found - Firebase disabled');
}

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Initialize Telegram Bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
console.log('✅ Telegram Bot initialized');

// Verification codes storage (geçici - production'da Redis kullan)
const verificationCodes = new Map();

// ID verifications storage (geçici - Firebase olmadan çalışması için)
const idVerifications = new Map();

// ============================================
// TELEGRAM BOT HANDLERS
// ============================================

bot.onText(/\/start verify_(.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const username = match[1];
    
    bot.sendMessage(chatId, 
        '🔐 *Hesap Doğrulama*\n\n' +
        'Uygulamadan aldığın 6 haneli kodu buraya gönder.',
        { parse_mode: 'Markdown' }
    );
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    
    // Ignore commands
    if (text.startsWith('/')) return;
    
    // Check if it's a 6-digit code
    if (/^\d{6}$/.test(text)) {
        try {
            // Generate confirmation code
            const confirmCode = Math.floor(100000 + Math.random() * 900000).toString();
            verificationCodes.set(chatId, {
                verificationCode: text,
                confirmCode: confirmCode,
                status: 'pending',
                timestamp: Date.now()
            });
            
            console.log('📱 Verification code stored:', { chatId, verificationCode: text, confirmCode, status: 'pending' });
            
            // Save to Firebase
            if (db) {
                await db.collection('verifications').add({
                    telegramId: chatId,
                    verificationCode: text,
                    confirmCode: confirmCode,
                    status: 'pending',
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }
            
            bot.sendMessage(chatId, 
                '✅ *Kod alındı!*\n\n' +
                `Onay kodu: \`${confirmCode}\`\n\n` +
                'Bu kodu uygulamaya gir.',
                { parse_mode: 'Markdown' }
            );
        } catch (error) {
            console.error('Error processing verification:', error);
            bot.sendMessage(chatId, '❌ Bir hata oluştu. Lütfen tekrar dene.');
        }
    }
});

// ============================================
// API ENDPOINTS
// ============================================

// Verify Telegram code
app.post('/api/verify-telegram', async (req, res) => {
    try {
        const { userId, code } = req.body;
        
        console.log('🔍 Verification request:', { userId, code });
        console.log('📋 Stored codes:', Array.from(verificationCodes.entries()).map(([id, data]) => ({ 
            chatId: id, 
            confirmCode: data.confirmCode, 
            status: data.status 
        })));
        
        // Check code in memory storage
        let found = false;
        for (const [chatId, data] of verificationCodes.entries()) {
            console.log(`Checking: ${data.confirmCode} === ${code} && ${data.status} === pending`);
            if (data.confirmCode === code && data.status === 'pending') {
                found = true;
                data.status = 'approved';
                console.log('✅ Code verified for chatId:', chatId);
                
                // If Firebase is available, save to database
                if (db) {
                    try {
                        await db.collection('users').doc(userId.toString()).set({
                            verified: true,
                            verificationMethod: 'telegram',
                            verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
                            telegramId: chatId
                        }, { merge: true });
                    } catch (dbError) {
                        console.warn('⚠️ Firebase save failed:', dbError.message);
                    }
                }
                
                break;
            }
        }
        
        if (found) {
            res.json({ success: true });
        } else {
            console.log('❌ Code not found or expired');
            res.json({ success: false, error: 'Invalid or expired code' });
        }
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Submit ID verification
app.post('/api/submit-id-verification', async (req, res) => {
    try {
        const { userId, userName, images, submittedAt } = req.body;
        
        console.log('📸 ID verification submitted:', { userId, userName });
        
        const verificationId = 'ver_' + Date.now();
        const verificationData = {
            id: verificationId,
            userId: userId,
            userName: userName,
            images: images,
            status: 'pending',
            submittedAt: submittedAt,
            createdAt: Date.now()
        };
        
        // Save to memory
        idVerifications.set(verificationId, verificationData);
        console.log('✅ ID verification saved to memory:', verificationId);
        console.log('📋 Total pending verifications:', idVerifications.size);
        
        // Also try to save to Firebase if available
        if (db) {
            try {
                await db.collection('id_verifications').doc(verificationId).set({
                    ...verificationData,
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });
                console.log('✅ Also saved to Firebase');
            } catch (dbError) {
                console.warn('⚠️ Firebase save failed:', dbError.message);
            }
        }
        
        res.json({ success: true, verificationId: verificationId });
    } catch (error) {
        console.error('ID verification error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get pending ID verifications (Admin)
app.get('/api/get-pending-verifications', async (req, res) => {
    try {
        let verifications = [];
        
        // First, get from memory
        for (const [id, data] of idVerifications.entries()) {
            if (data.status === 'pending') {
                verifications.push(data);
            }
        }
        
        console.log(`📋 Found ${verifications.length} pending verifications in memory`);
        
        // If Firebase is available, also check there
        if (db) {
            try {
                // Simplified query without orderBy to avoid index requirement
                const snapshot = await db.collection('id_verifications')
                    .where('status', '==', 'pending')
                    .get();
                
                const firebaseVerifications = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    firebaseVerifications.push({
                        id: doc.id,
                        ...data
                    });
                });
                
                // Sort in JavaScript instead of Firestore
                firebaseVerifications.sort((a, b) => {
                    const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : a.createdAt || 0;
                    const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : b.createdAt || 0;
                    return timeB - timeA; // Newest first
                });
                
                // Merge with memory verifications (avoid duplicates)
                const memoryIds = new Set(verifications.map(v => v.id));
                firebaseVerifications.forEach(v => {
                    if (!memoryIds.has(v.id)) {
                        verifications.push(v);
                    }
                });
                
                console.log(`📋 Found ${firebaseVerifications.length} pending verifications in Firebase`);
                console.log(`📋 Total: ${verifications.length} pending verifications`);
            } catch (dbError) {
                console.warn('⚠️ Firebase query failed:', dbError.message);
            }
        }
        
        res.json({ success: true, verifications: verifications });
    } catch (error) {
        console.error('Get verifications error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Approve ID verification (Admin endpoint)
app.post('/api/approve-id-verification', async (req, res) => {
    try {
        const { verificationId, userId, approved, reason } = req.body;
        
        console.log('✅ ID verification decision:', { verificationId, userId, approved, reason });
        
        // Update in memory
        if (idVerifications.has(verificationId)) {
            const verification = idVerifications.get(verificationId);
            verification.status = approved ? 'approved' : 'rejected';
            verification.reviewedAt = Date.now();
            if (reason) verification.rejectionReason = reason;
            idVerifications.set(verificationId, verification);
            console.log('✅ Updated in memory');
        }
        
        // Update in Firebase if available
        if (db) {
            try {
                const updateData = {
                    status: approved ? 'approved' : 'rejected',
                    reviewedAt: admin.firestore.FieldValue.serverTimestamp()
                };
                
                if (reason) {
                    updateData.rejectionReason = reason;
                }
                
                // Update verification status
                await db.collection('id_verifications').doc(verificationId).update(updateData);
                
                // If approved, update user
                if (approved) {
                    await db.collection('users').doc(userId.toString()).set({
                        verified: true,
                        verificationMethod: 'id',
                        verifiedAt: admin.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                }
                
                console.log('✅ Updated in Firebase');
            } catch (dbError) {
                console.warn('⚠️ Firebase update failed:', dbError.message);
            }
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Approval error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create Stripe payment intent
app.post('/api/create-payment-intent', async (req, res) => {
    try {
        const { amount, currency, userId, purpose, email } = req.body;
        
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: currency || 'try',
            metadata: {
                userId: userId.toString(),
                purpose: purpose
            },
            receipt_email: email,
            automatic_payment_methods: {
                enabled: true
            }
        });
        
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Payment intent error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Stripe webhook
app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook error:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // Handle payment success
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const userId = paymentIntent.metadata.userId;
        
        try {
            // Update user verification in Firebase
            if (db) {
                await db.collection('users').doc(userId).update({
                    verified: true,
                    verificationMethod: 'payment',
                    verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
                    paymentIntentId: paymentIntent.id
                });
                
                // Add points to user
                const userRef = db.collection('users').doc(userId);
                const userDoc = await userRef.get();
                const currentPoints = userDoc.data()?.points || 0;
                
                await userRef.update({
                    points: currentPoints + 100
                });
                
                console.log('✅ User verified via payment:', userId);
                
                // Send notification via Telegram
                const telegramId = userDoc.data()?.telegramId;
                if (telegramId) {
                    bot.sendMessage(telegramId, 
                        '🎉 *Ödeme Başarılı!*\n\n' +
                        'Hesabın doğrulandı ve 100 puan kazandın!',
                        { parse_mode: 'Markdown' }
                    );
                }
            }
        } catch (error) {
            console.error('Error updating user:', error);
        }
    }
    
    res.json({ received: true });
});

// Verify payment status
app.get('/api/verify-payment/:paymentIntentId', async (req, res) => {
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(
            req.params.paymentIntentId
        );
        
        res.json({
            verified: paymentIntent.status === 'succeeded',
            status: paymentIntent.status
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all accounts
app.get('/api/accounts', async (req, res) => {
    try {
        if (!db) {
            return res.json([]);
        }
        
        const snapshot = await db.collection('accounts')
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();
        
        const accounts = [];
        snapshot.forEach(doc => {
            accounts.push({ id: doc.id, ...doc.data() });
        });
        
        res.json(accounts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Save account
app.post('/api/accounts', async (req, res) => {
    try {
        if (!db) {
            return res.json({ success: false, error: 'Firebase not configured' });
        }
        
        const account = req.body;
        const docRef = await db.collection('accounts').add({
            ...account,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        res.json({ success: true, id: docRef.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Telegram bot active`);
    console.log(`💳 Stripe webhook ready`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down gracefully...');
    bot.stopPolling();
    process.exit(0);
});
