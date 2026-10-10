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
    doc
} from 'firebase/firestore';

interface ProductState {
    products: Cut[];
    isLoading: boolean;
    fetchProducts: () => Promise<void>;
    updateProduct: (id: string, updates: Partial<Cut>) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
    addProduct: (product: Cut) => Promise<void>;
}

export const useProductStore = create<ProductState>()(
    persist(
        (set) => ({
            products: [],
            isLoading: false,

            fetchProducts: async () => {
                set({ isLoading: true });
                try {
                    const productsCol = collection(db, 'products');
                    const productSnapshot = await getDocs(productsCol);
                    const productList = productSnapshot.docs.map(doc => ({
                        ...doc.data(),
                        id: doc.id
                    })) as Cut[];
                    
                    // Sort by categoryId on client side to avoid index issues
                    productList.sort((a, b) => String(a.categoryId).localeCompare(String(b.categoryId)));
                    
                    set({ products: productList, isLoading: false });
                } catch (error) {
                    console.error('Failed to fetch products from Firestore:', error);
                    set({ isLoading: false });
                }
            },

            updateProduct: async (id, updates) => {
                try {
                    const productRef = doc(db, 'products', id);
                    await updateDoc(productRef, {
                        ...updates,
                        updatedAt: new Date().toISOString()
                    });
                    set((state) => ({
                        products: state.products.map((product) =>
                            product.id === id ? { ...product, ...updates } : product
                        ),
                    }));
                } catch (error) {
                    console.error('Failed to update product in Firestore:', error);
                    throw error;
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
                    throw error;
                }
            },

            addProduct: async (product) => {
                try {
                    const productsCol = collection(db, 'products');
                    // Strip client temporary id so Firestore doesn't save conflicting id field
                    const { id: _tempId, ...productData } = product;
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
                    throw error;
                }
            },
        }),
        {
            name: 'product-storage',
        }
    )
);