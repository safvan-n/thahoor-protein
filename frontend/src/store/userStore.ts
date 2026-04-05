import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db, auth } from '../lib/firebase';
import { 
    collection, 
    query, 
    where, 
    onSnapshot,
    orderBy,
    limit,
    addDoc
} from 'firebase/firestore';

import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';

export interface User {
    name: string;
    email: string;
    uid?: string;
}

export interface Order {
    id: string;
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
    paymentMethod: 'COD';
    paymentProof?: string;
}

interface UserState {
    user: User | null;
    isAuthenticated: boolean;
    orders: Order[];
    loadingOrders: boolean;
    orderUnsubscribe: (() => void) | null;
    fetchOrders: (email: string) => void;
    login: (user: User) => void;
    logout: () => void;
    addOrder: (order: any) => Promise<any>;
    initializeAuth: () => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            orders: [],
            loadingOrders: false,
            orderUnsubscribe: null,

            initializeAuth: () => {
                onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
                    if (firebaseUser) {
                        set({ 
                            user: { 
                                name: firebaseUser.displayName || 'User', 
                                email: firebaseUser.email || '',
                                uid: firebaseUser.uid
                            }, 
                            isAuthenticated: true 
                        });
                        get().fetchOrders(firebaseUser.email || '');
                    } else {
                        set({ user: null, isAuthenticated: false, orders: [] });
                        const currentUnsubscribe = get().orderUnsubscribe;
                        if (currentUnsubscribe) {
                            currentUnsubscribe();
                            set({ orderUnsubscribe: null });
                        }
                    }
                });
            },

            fetchOrders: (email: string) => {
                if (!email) return;
                
                // Clear existing subscription if any
                const currentUnsubscribe = get().orderUnsubscribe;
                if (currentUnsubscribe) {
                    currentUnsubscribe();
                }

                set({ loadingOrders: true });
                const ordersCol = collection(db, 'orders');
                const q = query(
                    ordersCol, 
                    where('customer.email', '==', email),
                    orderBy('createdAt', 'desc'),
                    limit(20)
                );

                // Real-time listener for user orders
                const unsubscribe = onSnapshot(q, (snapshot) => {
                    const orderList = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    })) as Order[];
                    set({ orders: orderList, loadingOrders: false });
                }, (error) => {
                    console.error('Firestore orders subscription error:', error);
                    set({ loadingOrders: false });
                });

                set({ orderUnsubscribe: unsubscribe });
            },

            login: (user) => {
                set({ user, isAuthenticated: true });
                get().fetchOrders(user.email);
            },

            logout: async () => {
                const currentUnsubscribe = get().orderUnsubscribe;
                if (currentUnsubscribe) {
                    currentUnsubscribe();
                }
                await auth.signOut();
                set({ user: null, isAuthenticated: false, orders: [], orderUnsubscribe: null });
            },

            addOrder: async (orderData) => {
                try {
                    const ordersCol = collection(db, 'orders');
                    const timestamp = new Date().toISOString();
                    
                    const orderToSave = {
                        ...orderData,
                        isArchived: false,
                        isDeletedByUser: false,
                        createdAt: timestamp,
                        updatedAt: timestamp
                    };

                    const docRef = await addDoc(ordersCol, orderToSave);

                    return { 
                        id: docRef.id, 
                        ...orderToSave
                    };
                } catch (error) {
                    console.error('Failed to add order to Firestore:', error);
                    throw error;
                }
            },
        }),
        {
            name: 'user-storage',
            partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
        }
    )
);
