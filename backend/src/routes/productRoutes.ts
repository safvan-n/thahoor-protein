import express from 'express';
import { Product } from '../models/Product';

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products' });
    }
});

// Update product (Admin)
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const product = await Product.findOneAndUpdate({ id }, updates, { new: true });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error updating product' });
    }
});

// Seed Initial Data (Temporary helper)
// Seed Initial Data (Temporary helper)
import { CUTS } from '../data/products';
router.post('/seed', async (req, res) => {
    try {
        await Product.deleteMany({});
        await Product.insertMany(CUTS);
        res.json({ message: 'Database seeded' });
    } catch (error) {
        res.status(500).json({ message: 'Error seeding database' });
    }
});

export default router;
