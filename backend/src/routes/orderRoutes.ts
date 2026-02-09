import express from 'express';
import { Order } from '../models/Order';
import mongoose from 'mongoose';
import { getLocalOrders, saveLocalOrder, updateLocalOrder, getLocalOrdersByUser, archiveLocalOrder, archiveLocalOrderForUser } from '../db/localDb';
import { io } from '../index';

const router = express.Router();

// Place Order
router.post('/', async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const newOrder = new Order(req.body);
            const savedOrder = await newOrder.save();
            io.emit('newOrder', savedOrder);
            res.status(201).json(savedOrder);
        } else {
            console.log('MongoDB not connected, saving to local file');
            const newOrder = {
                ...req.body,
                _id: 'LOC-' + Date.now(),
                createdAt: new Date().toISOString()
            };
            const savedOrder = saveLocalOrder(newOrder);
            io.emit('newOrder', savedOrder);
            res.status(201).json(savedOrder);
        }
    } catch (error) {
        res.status(500).json({ message: 'Error placing order', error });
    }
});

// Get User Orders
router.get('/user/:email', async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const orders = await Order.find({
                'customer.email': req.params.email,
                isDeletedByUser: { $ne: true }
            }).sort({ createdAt: -1 });
            res.json(orders);
        } else {
            // Fetch local orders
            const allOrders = getLocalOrdersByUser(req.params.email);
            // Filter out deleted by user
            const activeOrders = allOrders.filter((o: any) => !o.isDeletedByUser);
            // safe sort
            activeOrders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            res.json(activeOrders);
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

// Admin: Get All Orders
router.get('/admin', async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const orders = await Order.find({ isArchived: { $ne: true } }).sort({ createdAt: -1 });
            res.json(orders);
        } else {
            const orders = getLocalOrders();
            orders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            res.json(orders);
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching all orders' });
    }
});

// Admin: Update Status / Assign Delivery
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, deliveryBoy } = req.body;

        let updatedOrder;

        if (mongoose.connection.readyState === 1) {
            const updates: any = {};
            if (status) updates.status = status;
            if (deliveryBoy) updates.deliveryBoy = deliveryBoy;
            updatedOrder = await Order.findByIdAndUpdate(id, updates, { new: true });
            res.json(updatedOrder);
        } else {
            const updates: any = {};
            if (status) updates.status = status;
            if (deliveryBoy) updates.deliveryBoy = deliveryBoy;
            updatedOrder = updateLocalOrder(id, updates);
            if (updatedOrder) res.json(updatedOrder);
            else res.status(404).json({ message: 'Order not found' });
        }

        // Emit socket event for real-time update
        if (updatedOrder) {
            io.emit('orderUpdated', updatedOrder);
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating order' });
    }
});

// Soft Delete Order (Archive)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const role = req.query.role; // 'user' or 'admin'
        let deleted = false;

        if (mongoose.connection.readyState === 1) {
            if (role === 'user') {
                const result = await Order.findByIdAndUpdate(id, { isDeletedByUser: true });
                if (result) deleted = true;
            } else {
                // Admin archive
                const result = await Order.findByIdAndUpdate(id, { isArchived: true });
                if (result) deleted = true;
            }
        } else {
            if (role === 'user') {
                deleted = archiveLocalOrderForUser(id);
            } else {
                deleted = archiveLocalOrder(id);
            }
        }

        if (deleted) {
            if (role !== 'user') {
                io.emit('orderDeleted', id); // Only emit to admin if admin deletes
            }
            res.json({ message: 'Order archived successfully' });
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting order' });
    }
});

// Serve Payment Proof Image
router.get('/:id/proof', async (req, res) => {
    try {
        const { id } = req.params;
        let order: any;

        if (mongoose.connection.readyState === 1) {
            order = await Order.findById(id);
        } else {
            const orders = getLocalOrders();
            order = orders.find((o: any) => o._id === id || o.orderId === id);
        }

        if (!order || !order.paymentProof) {
            return res.status(404).send('Payment proof not found');
        }

        const matches = order.paymentProof.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            console.error('Invalid payment proof format:', order.paymentProof.substring(0, 50) + '...');
            return res.status(400).send('Invalid image data');
        }

        const type = matches[1];
        const buffer = Buffer.from(matches[2], 'base64');

        res.set('Content-Type', type);
        res.send(buffer);

    } catch (error) {
        console.error('Error serving proof:', error);
        res.status(500).send('Error fetching proof');
    }
});

export default router;
