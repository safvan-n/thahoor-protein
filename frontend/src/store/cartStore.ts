import { create } from 'zustand';
import { type CartItem, type Cut } from '../types';

interface CartState {
    items: CartItem[];
    addToCart: (cut: Cut, qty: number) => void;
    removeFromCart: (cutId: string) => void;
    updateQty: (cutId: string, qty: number) => void;
    clearCart: () => void;
    total: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],
    addToCart: (cut, qty) => set((state) => {
        const existing = state.items.find(i => i.id === cut.id);
        if (existing) {
            return {
                items: state.items.map(i => i.id === cut.id ? { ...i, qtyKg: i.qtyKg + qty } : i)
            };
        }
        return { items: [...state.items, { ...cut, qtyKg: qty }] };
    }),
    removeFromCart: (cutId) => set((state) => ({
        items: state.items.filter(i => i.id !== cutId)
    })),
    updateQty: (cutId, qty) => set((state) => ({
        items: state.items.map(i => i.id === cutId ? { ...i, qtyKg: qty } : i)
    })),
    clearCart: () => set({ items: [] }),
    total: () => {
        const items = get().items;
        return items.reduce((acc, item) => acc + (item.pricePerKg * item.qtyKg), 0);
    }
}));
