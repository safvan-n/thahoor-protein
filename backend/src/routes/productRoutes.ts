import express from 'express';
import { Product } from '../models/Product';
import { CUTS } from '../data/products';

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

// Temporary: Seed database (GET for easy browser trigger)
router.get('/seed', async (req, res) => {
    try {
        await Product.deleteMany({});
        await Product.insertMany(CUTS);
        res.json({ message: 'Database seeded' });
    } catch (error) {
        res.status(500).json({ message: 'Error seeding database' });
    }
});

export default router;