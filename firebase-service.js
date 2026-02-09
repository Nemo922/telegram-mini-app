// Firebase Service
let db = null;
let auth = null;

// Initialize Firebase
function initializeFirebase() {
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        db = firebase.firestore();
        auth = firebase.auth();
        console.log('✅ Firebase initialized');
        return true;
    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        return false;
    }
}

// User Management
async function saveUserToFirebase(userData) {
    try {
        await db.collection('users').doc(userData.userId.toString()).set({
            ...userData,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log('✅ User saved to Firebase');
        return true;
    } catch (error) {
        console.error('❌ Error saving user:', error);
        return false;
    }
}

async function getUserFromFirebase(userId) {
    try {
        const doc = await db.collection('users').doc(userId.toString()).get();
        if (doc.exists) {
            return doc.data();
        }
        return null;
    } catch (error) {
        console.error('❌ Error getting user:', error);
        return null;
    }
}

// Account Management
async function saveAccountToFirebase(account) {
    try {
        await db.collection('accounts').doc(account.id.toString()).set({
            ...account,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log('✅ Account saved to Firebase');
        return true;
    } catch (error) {
        console.error('❌ Error saving account:', error);
        return false;
    }
}

async function getAccountsFromFirebase() {
    try {
        const snapshot = await db.collection('accounts').orderBy('createdAt', 'desc').get();
        const accounts = [];
        snapshot.forEach(doc => {
            accounts.push({ id: doc.id, ...doc.data() });
        });
        return accounts;
    } catch (error) {
        console.error('❌ Error getting accounts:', error);
        return [];
    }
}

async function deleteAccountFromFirebase(accountId) {
    try {
        await db.collection('accounts').doc(accountId.toString()).delete();
        console.log('✅ Account deleted from Firebase');
        return true;
    } catch (error) {
        console.error('❌ Error deleting account:', error);
        return false;
    }
}

// Verification Management
async function saveVerificationRequest(verificationData) {
    try {
        const docRef = await db.collection('verifications').add({
            ...verificationData,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ Verification request saved:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('❌ Error saving verification:', error);
        return null;
    }
}

async function updateVerificationStatus(verificationId, status) {
    try {
        await db.collection('verifications').doc(verificationId).update({
            status: status,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ Verification status updated');
        return true;
    } catch (error) {
        console.error('❌ Error updating verification:', error);
        return false;
    }
}

// Notification Management
async function saveNotificationToFirebase(userId, notification) {
    try {
        await db.collection('notifications').add({
            userId: userId,
            ...notification,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('❌ Error saving notification:', error);
        return false;
    }
}

// Real-time listeners
function listenToAccountChanges(callback) {
    return db.collection('accounts').onSnapshot(snapshot => {
        const accounts = [];
        snapshot.forEach(doc => {
            accounts.push({ id: doc.id, ...doc.data() });
        });
        callback(accounts);
    });
}

function listenToUserVerification(userId, callback) {
    return db.collection('verifications')
        .where('userId', '==', userId)
        .where('status', '==', 'approved')
        .onSnapshot(snapshot => {
            if (!snapshot.empty) {
                callback(true);
            }
        });
}

// Initialize on load
if (typeof firebaseConfig !== 'undefined') {
    initializeFirebase();
}
