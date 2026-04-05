import express from 'express';
import { adminDb } from '../lib/firebase-admin';
import { io } from '../index';

const router = express.Router();
const ordersCol = adminDb.collection('orders');

// Place Order
router.post('/', async (req, res) => {
    try {
        const orderData = req.body;
        const timestamp = new Date().toISOString();
        
        const docRef = await ordersCol.add({
            ...orderData,
            isArchived: false,
            isDeletedByUser: false,
            createdAt: timestamp,
            updatedAt: timestamp
        });

        const savedOrder = {
            id: docRef.id,
            ...orderData,
            createdAt: timestamp
        };

        io.emit('newOrder', savedOrder);
        res.status(201).json(savedOrder);
    } catch (error) {
        console.error('Firestore place order error:', error);
        res.status(500).json({ message: 'Error placing order', error });
    }
});

// Get User Orders
router.get('/user/:email', async (req, res) => {
    try {
        const snapshot = await ordersCol
            .where('customer.email', '==', req.params.email)
            .where('isDeletedByUser', '!=', true)
            .orderBy('isDeletedByUser') // Required for inequality filter
            .orderBy('createdAt', 'desc')
            .get();

        const orders = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        res.json(orders);
    } catch (error) {
        console.error('Firestore get user orders error:', error);
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

// Admin: Get All Active Orders
router.get('/admin', async (req, res) => {
    try {
        const snapshot = await ordersCol
            .where('isArchived', '!=', true)
            .orderBy('isArchived')
            .orderBy('createdAt', 'desc')
            .limit(100)
            .get();

        const orders = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        res.json(orders);
    } catch (error) {
        console.error('Firestore get admin orders error:', error);
        res.status(500).json({ message: 'Error fetching all orders' });
    }
});

// Admin: Update Status / Assign Delivery
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, deliveryBoy } = req.body;

        const orderRef = ordersCol.doc(id);
        const doc = await orderRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const updates: any = {
            updatedAt: new Date().toISOString()
        };
        if (status) updates.status = status;
        if (deliveryBoy) updates.deliveryBoy = deliveryBoy;

        await orderRef.update(updates);
        
        const updatedOrder = { id, ...doc.data(), ...updates };
        io.emit('orderUpdated', updatedOrder);
        res.json(updatedOrder);

    } catch (error) {
        console.error('Firestore update order error:', error);
        res.status(500).json({ message: 'Error updating order' });
    }
});

// Soft Delete Order (Archive)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const role = req.query.role; // 'user' or 'admin'
        
        const orderRef = ordersCol.doc(id);
        const doc = await orderRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const updates: any = {
            updatedAt: new Date().toISOString()
        };

        if (role === 'user') {
            updates.isDeletedByUser = true;
        } else {
            updates.isArchived = true;
        }

        await orderRef.update(updates);

        if (role !== 'user') {
            io.emit('orderDeleted', id);
        }
        res.json({ message: 'Order archived successfully' });
        
    } catch (error) {
        console.error('Firestore delete order error:', error);
        res.status(500).json({ message: 'Error deleting order' });
    }
});

export default router;
