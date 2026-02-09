import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
    name: string;
    email: string;
}

export interface Order {
    _id: string;
    orderId: string;
    createdAt: string;
    customer: {
        name: string;
        email: string;
        phone: string;
        address: {
            street: string;
            city: string;
            pincode: string;
            landmark?: string;
        }
    };
    status: 'Placed' | 'Confirmed' | 'On the Way' | 'Delivered' | 'Cancelled';
    totalAmount: number;
    items: { name: string; qty: number; price: number }[];
    deliveryBoy?: { name: string; phone: string };
}

interface UserState {
    user: User | null;
    isAuthenticated: boolean;
    orders: Order[];
    fetchOrders: (email: string) => Promise<void>;
    login: (user: User) => void;
    logout: () => void;
    addOrder: (order: any) => Promise<void>;
}

import { io } from 'socket.io-client';

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            orders: [],
            fetchOrders: async (email: string) => {
                try {
                    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/user/${email}`);
                    if (!res.ok) throw new Error('Failed to fetch');
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        set({ orders: data });
                    }

                    // Initialize Socket.io connection if not already active
                    // We can also do this in a separate init function or useEffect in the component
                    // But doing it here ensures it connects when we fetch orders (user is active)
                    const socket = io(import.meta.env.VITE_API_URL);

                    socket.on('connect', () => {
                        console.log('Connected to socket server');
                    });

                    socket.on('orderUpdated', (updatedOrder: Order) => {
                        const currentUser = get().user;
                        if (currentUser && updatedOrder.customer?.email === currentUser.email) {
                            set((state) => ({
                                orders: state.orders.map((order) =>
                                    order._id === updatedOrder._id || order.orderId === updatedOrder.orderId ? updatedOrder : order
                                )
                            }));
                        }
                    });

                } catch (error) {
                    console.error('Failed to fetch orders:', error);
                }
            },
            login: (user) => {
                set({ user, isAuthenticated: true });
                // trigger fetch
                // This will be called manually for now or we can expose fetchOrders
            },
            logout: () => {
                set({ user: null, isAuthenticated: false, orders: [] });
                // Note: We might want to disconnect socket here if we stored it in state,
                // but for now, simple implementation logic is fine.
            },
            addOrder: async (order) => {
                try {
                    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(order)
                    });
                    const savedOrder = await res.json();
                    set((state) => ({ orders: [savedOrder, ...state.orders] }));
                    return savedOrder;
                } catch (error) {
                    console.error('Failed to add order:', error);
                    throw error;
                }
            },
        }),
        {
            name: 'user-storage',
        }
    )
);
