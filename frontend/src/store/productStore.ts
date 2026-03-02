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

// ✅ Fallback backend URL (important)
const API_URL =
    import.meta.env.VITE_API_URL ||
    "https://thahoor-protein.onrender.com";

export const useProductStore = create<ProductState>()(
    persist(
        (set) => ({
            products: [],

            fetchProducts: async () => {
                try {
                    console.log("Using API URL:", API_URL);

                    const res = await fetch(`${API_URL}/api/products`);

                    if (!res.ok) {
                        throw new Error("Failed to fetch products");
                    }

                    const data = await res.json();

                    // ✅ Always trust backend data
                    set({ products: data });

                } catch (error) {
                    console.error('Failed to fetch products:', error);
                }
            },

            updateProduct: async (id, updates) => {
                try {
                    await fetch(`${API_URL}/api/products/${id}`, {
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

            deleteProduct: (id) =>
                set((state) => ({
                    products: state.products.filter((product) => product.id !== id),
                })),

            addProduct: (product) =>
                set((state) => ({
                    products: [...state.products, product],
                })),
        }),
        {
            name: 'product-storage',
        }
    )
);