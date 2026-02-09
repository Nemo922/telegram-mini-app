// Firebase bağlantısını test et
const admin = require('firebase-admin');
const fs = require('fs');

console.log('🔍 Testing Firebase connection...\n');

// Check if serviceAccountKey.json exists
if (!fs.existsSync('./serviceAccountKey.json')) {
    console.error('❌ serviceAccountKey.json NOT FOUND!');
    console.log('\n📝 To fix this:');
    console.log('1. Go to: https://console.firebase.google.com/');
    console.log('2. Select your project: pubg-marketplace-45010');
    console.log('3. Settings ⚙️ → Project settings → Service accounts');
    console.log('4. Click "Generate new private key"');
    console.log('5. Save as: serviceAccountKey.json');
    console.log('6. Copy to: ' + __dirname);
    process.exit(1);
}

console.log('✅ serviceAccountKey.json found\n');

try {
    // Initialize Firebase
    admin.initializeApp({
        credential: admin.credential.cert(require('./serviceAccountKey.json'))
    });
    
    const db = admin.firestore();
    console.log('✅ Firebase Admin initialized\n');
    
    // Test write
    console.log('📝 Testing write...');
    db.collection('test').doc('connection_test').set({
        message: 'Firebase connection successful!',
        timestamp: admin.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        console.log('✅ Write successful\n');
        
        // Test read
        console.log('📖 Testing read...');
        return db.collection('test').doc('connection_test').get();
    }).then((doc) => {
        if (doc.exists) {
            console.log('✅ Read successful');
            console.log('📄 Data:', doc.data());
            console.log('\n🎉 Firebase is working perfectly!\n');
        }
        process.exit(0);
    }).catch((error) => {
        console.error('❌ Firebase error:', error.message);
        process.exit(1);
    });
    
} catch (error) {
    console.error('❌ Initialization error:', error.message);
    process.exit(1);
}
