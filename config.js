// Firebase Configuration
// Firebase Console'dan aldığın config'i buraya yapıştır
const firebaseConfig = {
    apiKey: "AIzaSyDvr8UX48Ez6E5w-WEd0b7zMWOmFC_0xrs",
    authDomain: "pubg-marketplace-45010.firebaseapp.com",
    projectId: "pubg-marketplace-45010",
    storageBucket: "pubg-marketplace-45010.firebasestorage.app",
    messagingSenderId: "769587727178",
    appId: "1:769587727178:web:b4ca1434c0f5f9e0fb03",
    measurementId: "G-D1VH0kLMHM"
};

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = "BURAYA_TOKEN_YAPISTIR"; // BotFather'dan aldığın token
const TELEGRAM_BOT_USERNAME = "pubgmarket_verify_bot"; // Bot username'in (senin seçtiğin)

// Stripe Configuration
const STRIPE_PUBLISHABLE_KEY = "pk_test_YOUR_PUBLISHABLE_KEY"; // Stripe publishable key

// Admin Configuration
const ADMIN_TELEGRAM_ID = 123456789; // Kendi Telegram ID'n

// Export configurations
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        firebaseConfig,
        TELEGRAM_BOT_TOKEN,
        TELEGRAM_BOT_USERNAME,
        STRIPE_PUBLISHABLE_KEY,
        ADMIN_TELEGRAM_ID
    };
}
