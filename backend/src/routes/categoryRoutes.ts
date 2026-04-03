import express from 'express';
import { adminDb } from '../lib/firebase-admin';

const router = express.Router();
const categoriesCol = adminDb.collection('categories');

// Get all categories
router.get('/', async (req, res) => {
    try {
        const snapshot = await categoriesCol.get();
        const categories = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.json(categories);
    } catch (error) {
        console.error('Firestore get categories error:', error);
        res.status(500).json({ message: 'Error fetching categories' });
    }
});

// Add new category
router.post('/', async (req, res) => {
    try {
        const { name, description, image } = req.body;
        
        const timestamp = new Date().toISOString();
        const docRef = await categoriesCol.add({
            name,
            description: description || '',
            image: image || '',
            createdAt: timestamp,
            updatedAt: timestamp
        });

        const newCategory = {
            id: docRef.id,
            name,
            description,
            image,
            createdAt: timestamp
        };

        res.status(201).json(newCategory);
    } catch (error) {
        console.error('Firestore add category error:', error);
        res.status(500).json({ message: 'Error adding category' });
    }
});

// Update category
router.patch('/:id', async (req, res) => {
    try {
        const categoryRef = categoriesCol.doc(req.params.id);
        const doc = await categoryRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'Category not found' });
        }

        const updates = {
            ...req.body,
            updatedAt: new Date().toISOString()
        };

        await categoryRef.update(updates);
        res.json({ id: req.params.id, ...updates });
    } catch (error) {
        console.error('Firestore update category error:', error);
        res.status(500).json({ message: 'Error updating category' });
    }
});

// Delete category
router.delete('/:id', async (req, res) => {
    try {
        const categoryRef = categoriesCol.doc(req.params.id);
        const doc = await categoryRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'Category not found' });
        }

        await categoryRef.delete();
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Firestore delete category error:', error);
        res.status(500).json({ message: 'Error deleting category' });
    }
});

export default router;
