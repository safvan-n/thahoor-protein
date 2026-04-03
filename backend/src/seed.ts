import * as admin from 'firebase-admin';
import * as path from 'path';

// Chicken, Fish, Beef, etc.
const categories = [
    { id: '1', name: 'Chicken', description: 'Fresh, farm-raised chicken', image: '/assets/categories/chicken.jpg' },
    { id: '2', name: 'Fish', description: 'Premium catch of the day', image: '/assets/categories/fish.jpg' },
    { id: '3', name: 'Beef', description: 'Tender beef cuts', image: '/assets/categories/beef.jpg' },
    { id: '4', name: 'Mutton', description: 'High-quality goat meat', image: '/assets/categories/mutton.jpg' },
    { id: '5', name: 'Liver & More', description: 'Nutrient-rich organ meats', image: '/assets/categories/liver.jpg' },
    { id: '6', name: 'Combos', description: 'Value packs for more savings', image: '/assets/categories/combo.jpg' },
];

const products = [
    { id: '101', categoryId: '1', name: 'Chicken Curry Cut', description: 'Skinless, bone-in pieces perfect for curries.', pricePerKg: 240, image: '/assets/categories/chicken.jpg' },
    { id: '102', categoryId: '1', name: 'Chicken Boneless Cut', description: 'Tender, juicy boneless pieces.', pricePerKg: 340, image: '/assets/categories/chicken.jpg' },
    { id: '103', categoryId: '1', name: 'Chicken Biryani Cut', description: 'Large pieces ideal for aromatic biryanis.', pricePerKg: 260, image: '/assets/categories/chicken.jpg' },
    { id: '201', categoryId: '2', name: 'Sardine (Mathi)', description: 'Fresh, oil-rich sardines.', pricePerKg: 180, image: '/assets/categories/fish.jpg' },
    { id: '301', categoryId: '3', name: 'Beef Curry Cut', description: 'Cubed beef perfect for slow cooking.', pricePerKg: 420, image: '/assets/categories/beef.jpg' },
    { id: '401', categoryId: '4', name: 'Mutton Curry Cut', description: 'Bone-in goat meat for authentic flavor.', pricePerKg: 850, image: '/assets/categories/mutton.jpg' },
];

const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');

async function seed() {
    console.log('🚀 Starting Master Seed...');
    
    try {
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccountPath)
            });
        }
        
        const db = admin.firestore();
        
        console.log('📦 Seeding Categories...');
        for (const cat of categories) {
            await db.collection('categories').doc(cat.id).set({
                ...cat,
                createdAt: new Date().toISOString()
            });
            console.log(`✅ Seeded Category: ${cat.name}`);
        }
        
        console.log('🍱 Seeding Products...');
        for (const prod of products) {
            await db.collection('products').doc(prod.id).set({
                ...prod,
                isAvailable: true,
                createdAt: new Date().toISOString()
            });
            console.log(`✅ Seeded Product: ${prod.name}`);
        }
        
        console.log('✨ Data Restoration Complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Master Seed Failed:', error);
        process.exit(1);
    }
}

seed();
