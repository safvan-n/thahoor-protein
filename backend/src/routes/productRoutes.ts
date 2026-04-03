import express from 'express';
import { adminDb } from '../lib/firebase-admin';
import { CUTS } from '../data/products';

const router = express.Router();
const productsCol = adminDb.collection('products');
const categoriesCol = adminDb.collection('categories');

// Seed Firestore (One-time trigger)
router.get('/seed', async (req, res) => {
    try {
        const categories = [
            { id: '1', name: 'Chicken', description: 'Fresh, farm-raised chicken', image: '/assets/categories/chicken.jpg' },
            { id: '2', name: 'Fish', description: 'Premium catch of the day', image: '/assets/categories/fish.jpg' },
            { id: '3', name: 'Beef', description: 'Tender beef cuts', image: '/assets/categories/beef.jpg' },
            { id: '4', name: 'Mutton', description: 'High-quality goat meat', image: '/assets/categories/mutton.jpg' },
            { id: '5', name: 'Liver & More', description: 'Nutrient-rich organ meats', image: '/assets/categories/liver.jpg' },
            { id: '6', name: 'Combos', description: 'Value packs for more savings', image: '/assets/categories/combo.jpg' },
        ];

        // Seeding categories
        console.log('Seeding categories...');
        for (const cat of categories) {
            await categoriesCol.doc(cat.id).set({
                ...cat,
                createdAt: new Date().toISOString()
            });
        }

        // Seeding products
        console.log('Seeding products...');
        for (const product of CUTS) {
            await productsCol.doc(product.id).set({
                ...product,
                isAvailable: true,
                createdAt: new Date().toISOString()
            });
        }

        res.json({ message: 'Firestore successfully seeded with categories and products!' });
    } catch (error: any) {
        console.error('CRITICAL SEEDING ERROR:', error);
        res.status(500).json({ 
            message: 'Error seeding Firestore', 
            details: error.message,
            code: error.code
        });
    }
});

// Get all products
router.get('/', async (req, res) => {
    try {
        const snapshot = await productsCol.get();
        const products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.json(products);
    } catch (error) {
        console.error('Firestore get products error:', error);
        res.status(500).json({ message: 'Error fetching products' });
    }
});

// Add new product
router.post('/', async (req, res) => {
    try {
        const { name, pricePerKg, categoryId, image, description, isAvailable } = req.body;
        
        const timestamp = new Date().toISOString();
        const docRef = await productsCol.add({
            name,
            pricePerKg,
            categoryId,
            image,
            description: description || '',
            isAvailable: isAvailable ?? true,
            createdAt: timestamp,
            updatedAt: timestamp
        });

        const newProduct = {
            id: docRef.id,
            name,
            pricePerKg,
            categoryId,
            image,
            description: description || '',
            isAvailable: isAvailable ?? true,
            createdAt: timestamp
        };

        res.status(201).json(newProduct);
    } catch (error) {
        console.error('Firestore add product error:', error);
        res.status(500).json({ message: 'Error adding product' });
    }
});

// Update product
router.patch('/:id', async (req, res) => {
    try {
        const productRef = productsCol.doc(req.params.id);
        const doc = await productRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const updates = {
            ...req.body,
            updatedAt: new Date().toISOString()
        };

        await productRef.update(updates);
        res.json({ id: req.params.id, ...updates });
    } catch (error) {
        console.error('Firestore update product error:', error);
        res.status(500).json({ message: 'Error updating product' });
    }
});

// Delete product
router.delete('/:id', async (req, res) => {
    try {
        const productRef = productsCol.doc(req.params.id);
        const doc = await productRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await productRef.delete();
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Firestore delete product error:', error);
        res.status(500).json({ message: 'Error deleting product' });
    }
});

export default router;