import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Cut } from '../types';

interface ProductState {
    products: Cut[];
    fetchProducts: () => Promise<void>;
    updateProduct: (id: string, updates: Partial<Cut>) => void;
    deleteProduct: (id: string) => void;
    addProduct: (product: Cut) => void;
}

export const useProductStore = create<ProductState>()(
    persist(
        (set) => ({
            products: [],
            fetchProducts: async () => {
                try {
                    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
                    const data = await res.json();
                    if (data.length > 0) {
                        set({ products: data });
                    } else {
                        // Seed if empty (first run)
                        await fetch(`${import.meta.env.VITE_API_URL}/api/products/seed`, { method: 'POST' });
                        const seeded = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
                        set({ products: await seeded.json() });
                    }
                } catch (error) {
                    console.error('Failed to fetch products:', error);
                }
            },
            updateProduct: async (id, updates) => {
                try {
                    await fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updates)
                    });
                    set((state) => ({
                        products: state.products.map((product) =>
                            product.id === id ? { ...product, ...updates } : product
                        ),
                    }));
                } catch (error) {
                    console.error('Failed to update product:', error);
                }
            },
            deleteProduct: (id) => set((state) => ({
                products: state.products.filter((product) => product.id !== id),
            })),
            addProduct: (product) => set((state) => ({
                products: [...state.products, product],
            })),
        }),
        {
            name: 'product-storage',
            // Only persist products, not actions (though actions aren't part of state anyway)
        }
    )
);
