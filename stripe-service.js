// Stripe Payment Service

let stripe = null;

// Initialize Stripe
function initializeStripe() {
    try {
        if (typeof Stripe !== 'undefined') {
            stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
            console.log('✅ Stripe initialized');
            return true;
        }
        console.warn('⚠️ Stripe not loaded');
        return false;
    } catch (error) {
        console.error('❌ Stripe initialization error:', error);
        return false;
    }
}

// Create payment intent for verification (1 TL)
async function createVerificationPayment(userId, userEmail) {
    try {
        // Backend'e istek at
        const response = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: 100, // 1 TL = 100 kuruş
                currency: 'try',
                userId: userId,
                purpose: 'verification',
                email: userEmail
            })
        });
        
        const data = await response.json();
        return data.clientSecret;
    } catch (error) {
        console.error('❌ Error creating payment:', error);
        return null;
    }
}

// Process card payment
async function processCardPayment(cardElement, clientSecret) {
    try {
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement
            }
        });
        
        if (error) {
            console.error('❌ Payment error:', error);
            return { success: false, error: error.message };
        }
        
        if (paymentIntent.status === 'succeeded') {
            console.log('✅ Payment successful');
            return { success: true, paymentIntent };
        }
        
        return { success: false, error: 'Payment failed' };
    } catch (error) {
        console.error('❌ Payment processing error:', error);
        return { success: false, error: error.message };
    }
}

// Create Stripe card element
function createCardElement(elementId) {
    if (!stripe) {
        console.error('❌ Stripe not initialized');
        return null;
    }
    
    const elements = stripe.elements();
    const cardElement = elements.create('card', {
        style: {
            base: {
                color: '#fff',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSize: '16px',
                '::placeholder': {
                    color: '#6b6d78'
                }
            },
            invalid: {
                color: '#ff3b30',
                iconColor: '#ff3b30'
            }
        }
    });
    
    cardElement.mount(`#${elementId}`);
    return cardElement;
}

// Verify payment status
async function verifyPaymentStatus(paymentIntentId) {
    try {
        const response = await fetch(`/api/verify-payment/${paymentIntentId}`);
        const data = await response.json();
        return data.verified;
    } catch (error) {
        console.error('❌ Error verifying payment:', error);
        return false;
    }
}

// Initialize on load
if (typeof Stripe !== 'undefined' && typeof STRIPE_PUBLISHABLE_KEY !== 'undefined') {
    window.addEventListener('load', () => {
        setTimeout(initializeStripe, 1000);
    });
}

/* Backend Implementation (Node.js + Express + Stripe)

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const express = require('express');
const app = express();

app.use(express.json());

// Create payment intent
app.post('/api/create-payment-intent', async (req, res) => {
    try {
        const { amount, currency, userId, purpose, email } = req.body;
        
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: currency,
            metadata: {
                userId: userId,
                purpose: purpose
            },
            receipt_email: email
        });
        
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Webhook for payment confirmation
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
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // Handle payment success
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const userId = paymentIntent.metadata.userId;
        
        // Update user verification in Firebase
        await db.collection('users').doc(userId).update({
            verified: true,
            verificationMethod: 'payment',
            verifiedAt: new Date(),
            paymentIntentId: paymentIntent.id
        });
        
        // Add points to user
        await db.collection('users').doc(userId).update({
            points: firebase.firestore.FieldValue.increment(100)
        });
        
        console.log('✅ User verified via payment:', userId);
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

app.listen(3000, () => console.log('Server running on port 3000'));
*/
