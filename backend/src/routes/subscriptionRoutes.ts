import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import mongoose from 'mongoose';
import Subscription from '../models/Subscription';

const router = express.Router();

const SUBSCRIPTION_AMOUNT = 2105;

// Helper to calculate current billing cycle
// "The subscription should begin from today 19/03/2026 and recur monthly."
export function getCurrentCycleId() {
    const now = new Date();
    
    let startYear = now.getFullYear();
    let startMonth = now.getMonth(); // 0-indexed
    
    // If today is before the 19th, the cycle started in the previous month
    if (now.getDate() < 19) {
        startMonth--;
        if (startMonth < 0) {
            startMonth = 11;
            startYear--;
        }
    }
    
    // Minimum start is March 19, 2026
    if (startYear < 2026 || (startYear === 2026 && startMonth < 2)) {
        startYear = 2026;
        startMonth = 2; // March is index 2
    }

    const startStr = `${startYear}-${String(startMonth + 1).padStart(2, '0')}-19`;
    
    // End date is 19th of the next month
    let endMonth = startMonth + 1;
    let endYear = startYear;
    if (endMonth > 11) {
        endMonth = 0;
        endYear++;
    }
    const endStr = `${endYear}-${String(endMonth + 1).padStart(2, '0')}-19`;

    return `${startStr}_to_${endStr}`;
}

// 1. Check if the current cycle is paid
router.get('/status', async (req, res) => {
    try {
        const cycleId = getCurrentCycleId();
        
        let isPaid = false;
        let lastPaymentDate = null;

        if (mongoose.connection.readyState === 1) {
            // MongoDB is connected
            const currentSub = await Subscription.findOne({ cycleId, paymentStatus: 'Completed' });
            if (currentSub) {
                isPaid = true;
                lastPaymentDate = currentSub.paidAt;
            }
        }

        res.json({
            isPaid,
            cycleId,
            amount: SUBSCRIPTION_AMOUNT,
            lastPaymentDate
        });
    } catch (error) {
        console.error("Subscription status error", error);
        res.status(500).json({ error: "Failed to check subscription status" });
    }
});

// 2. Create Razorpay order
router.post('/create-order', async (req, res) => {
    try {
        const cycleId = getCurrentCycleId();
        
        // Verify not already paid
        if (mongoose.connection.readyState === 1) {
            const existing = await Subscription.findOne({ cycleId, paymentStatus: 'Completed' });
            if (existing) {
                return res.status(400).json({ error: "Subscription for this cycle is already paid." });
            }
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || 'dummy_id',
            key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret'
        });

        const options = {
            amount: SUBSCRIPTION_AMOUNT * 100, // Amount in paise
            currency: "INR",
            receipt: `sub_${Date.now()}` // Max 40 characters allowed by Razorpay
        };

        const order = await razorpay.orders.create(options);
        
        // Create an initial Pending subscription record
        if (mongoose.connection.readyState === 1) {
            await Subscription.findOneAndUpdate(
                { cycleId },
                { 
                    cycleId, 
                    amount: SUBSCRIPTION_AMOUNT, 
                    paymentStatus: 'Pending',
                    razorpayOrderId: order.id
                },
                { upsert: true, new: true }
            );
        }

        res.json(order);
    } catch (error) {
        console.error("Razorpay order error", error);
        res.status(500).json({ error: "Failed to create payment order" });
    }
});

// 3. Verify Payment
router.post('/verify', async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const cycleId = getCurrentCycleId();

        const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_secret';

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Update the subscription record
            if (mongoose.connection.readyState === 1) {
                await Subscription.findOneAndUpdate(
                    { cycleId, razorpayOrderId: razorpay_order_id },
                    { 
                        paymentStatus: 'Completed',
                        razorpayPaymentId: razorpay_payment_id,
                        razorpaySignature: razorpay_signature,
                        paidAt: new Date()
                    }
                );
            }

            res.json({ success: true, message: "Payment verified successfully" });
        } else {
            if (mongoose.connection.readyState === 1) {
                await Subscription.findOneAndUpdate(
                    { cycleId, razorpayOrderId: razorpay_order_id },
                    { paymentStatus: 'Failed' }
                );
            }
            res.status(400).json({ success: false, error: "Invalid payment signature" });
        }
    } catch (error) {
        console.error("Payment verification error", error);
        res.status(500).json({ error: "Payment verification failed" });
    }
});

export default router;
