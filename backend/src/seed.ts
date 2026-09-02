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
    // Chicken (Category 1)
    { id: '101', categoryId: '1', name: 'Chicken Curry Cut', description: 'Skinless, bone-in pieces perfect for authentic curries. Vacuum-packed to retain freshness.', pricePerKg: 240, image: '/assets/categories/chicken.jpg' },
    { id: '102', categoryId: '1', name: 'Chicken Boneless Cubes - Regular', description: 'Fresh chicken breast boneless pieces cleaned and cut into medium pieces. Ideal for quick meals.', pricePerKg: 478, image: 'https://salaamfood.com/admin/uploads/product/thumb/12-Chicken_Boneless_Regular_Pieces.jpg' },
    { id: '103', categoryId: '1', name: 'Chicken Boneless Cubes - Large', description: 'Premium boneless chicken breast cut into large cubes, perfect for grills, tikkas and air-frying.', pricePerKg: 478, image: 'https://salaamfood.com/admin/uploads/product/thumb/13-Chicken_Boneless_Large_pieces.jpg' },
    { id: '104', categoryId: '1', name: 'Chicken Full Leg Boneless', description: 'Juicy and tender boneless meat from the full leg. Superior texture for gourmet preparations.', pricePerKg: 498, image: 'https://salaamfood.com/admin/uploads/product/thumb/15-Chicken_Full_Leg_Boneless.jpg' },
    { id: '105', categoryId: '1', name: 'Chicken Breast Fillet', description: 'Tender and thin slices of heritage chicken breast, ideal for quick pan-frying or schnitzels.', pricePerKg: 478, image: 'https://salaamfood.com/admin/uploads/product/thumb/16-Chicken_Fillet.jpg' },

    // Fish (Category 2)
    { id: '201', categoryId: '2', name: 'Sardine (Mathi)', description: 'Fresh, oil-rich sardines sourced daily from local coastal waters.', pricePerKg: 180, image: '/assets/categories/fish.jpg' },
    { id: '202', categoryId: '2', name: 'Surmai (King Fish) Boneless Cubes', description: 'Premium King Fish cleaned and cut into boneless cubes. Sourced from deep-sea 1.25kg+ fish.', pricePerKg: 1980, image: 'https://salaamfood.com/admin/uploads/product/thumb/2-Surmai_Cubes_copy_2.jpg' },
    { id: '203', categoryId: '2', name: 'Surmai Fish Fillet with Skin', description: 'Large fillets of King Fish with skin on, retaining natural heart-healthy oils and rich flavor.', pricePerKg: 1980, image: 'https://salaamfood.com/admin/uploads/product/thumb/3-Surmail_FIllet.jpg' },
    { id: '204', categoryId: '2', name: 'Surmai Steaks with Skin', description: 'Thick-cut steaks of King Fish, precision-sliced for the perfect frying or grilling experience.', pricePerKg: 1580, image: 'https://salaamfood.com/admin/uploads/product/thumb/4-Surmai_Steaks.jpg' },

    // Beef (Category 3)
    { id: '301', categoryId: '3', name: 'Beef Curry Cut', description: 'Cubed tender beef perfect for slow cooking and traditional stews.', pricePerKg: 420, image: '/assets/categories/beef.jpg' },
    { id: '302', categoryId: '3', name: 'Beef Fatless & Boneless', description: 'Lean and fresh beef uncut pieces, 100% free from fat. High protein, zero compromise.', pricePerKg: 698, image: 'https://salaamfood.com/admin/uploads/product/thumb/133-Beef_uncut.jpg' },
    { id: '303', categoryId: '3', name: 'Beef Fatless Cubes', description: 'Precisely cut fat-free beef cubes, ready for premium stews, roasts and healthy curries.', pricePerKg: 698, image: 'https://salaamfood.com/admin/uploads/product/thumb/134-Beef_Fatless_Cubes.jpg' },
    { id: '304', categoryId: '3', name: 'Beef Kerala Diced Cut', description: 'Beef cut into small diced pieces, specifically tailored for traditional Kerala style dry-fry preparations.', pricePerKg: 698, image: 'https://salaamfood.com/admin/uploads/product/thumb/138-Beef_Kerala_cut.jpg' },
    { id: '305', categoryId: '3', name: 'Beef Fatless Qeema (Mince)', description: 'Fine-textured lean beef mince, ideal for gourmet kebabs, bolognese, and keema dishes.', pricePerKg: 698, image: 'https://salaamfood.com/admin/uploads/product/thumb/139-Beef_Fatless_Kheema.jpg' },

    // Mutton (Category 4)
    { id: '401', categoryId: '4', name: 'Mutton Curry Cut', description: 'Bone-in tender goat meat for authentic flavor and rich gravies.', pricePerKg: 950, image: '/assets/categories/mutton.jpg' },
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
