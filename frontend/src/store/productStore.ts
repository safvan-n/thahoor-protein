import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Cut } from '../types';
import { db } from '../lib/firebase';
import { 
    collection, 
    getDocs, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc,
    query,
    orderBy 
} from 'firebase/firestore';

interface ProductState {
    products: Cut[];
    fetchProducts: () => Promise<void>;
    updateProduct: (id: string, updates: Partial<Cut>) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
    addProduct: (product: Cut) => Promise<void>;
}

export const useProductStore = create<ProductState>()(
    persist(
        (set) => ({
            products: [],

            fetchProducts: async () => {
                try {
                    const productsCol = collection(db, 'products');
                    const productSnapshot = await getDocs(query(productsCol, orderBy('categoryId')));
                    const productList = productSnapshot.docs.map(doc => ({
                        ...doc.data(),
                        id: doc.id
                    })) as Cut[];
                    
                    set({ products: productList });
                } catch (error) {
                    console.error('Failed to fetch products from Firestore:', error);
                }
            },

            updateProduct: async (id, updates) => {
                try {
                    const productRef = doc(db, 'products', id);
                    await updateDoc(productRef, updates);
                    set((state) => ({
                        products: state.products.map((product) =>
                            product.id === id ? { ...product, ...updates } : product
                        ),
                    }));
                } catch (error) {
                    console.error('Failed to update product in Firestore:', error);
                }
            },

            deleteProduct: async (id) => {
                try {
                    const productRef = doc(db, 'products', id);
                    await deleteDoc(productRef);
                    set((state) => ({
                        products: state.products.filter((product) => product.id !== id),
                    }));
                } catch (error) {
                    console.error('Failed to delete product from Firestore:', error);
                }
            },

            addProduct: async (product) => {
                try {
                    const productsCol = collection(db, 'products');
                    // Ensure we don't have double IDs
                    const { id, ...productData } = product;
                    const docRef = await addDoc(productsCol, {
                        ...productData,
                        createdAt: new Date().toISOString()
                    });
                    
                    const newProduct = { ...product, id: docRef.id };
                    set((state) => ({
                        products: [...state.products, newProduct],
                    }));
                } catch (error) {
                    console.error('Failed to add product to Firestore:', error);
                }
            },
        }),
        {
            name: 'product-storage',
        }
    )
);