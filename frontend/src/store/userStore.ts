import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db, auth, storage } from '../lib/firebase';
import { 
    collection, 
    query, 
    where, 
    onSnapshot,
    orderBy,
    limit,
    addDoc
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
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
    paymentMethod: 'COD' | 'Online';
    paymentProof?: string;
}

interface UserState {
    user: User | null;
    isAuthenticated: boolean;
    orders: Order[];
    loadingOrders: boolean;
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
                    }
                });
            },

            fetchOrders: (email: string) => {
                if (!email) return;
                
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

                return unsubscribe;
            },

            login: (user) => {
                set({ user, isAuthenticated: true });
                get().fetchOrders(user.email);
            },

            logout: async () => {
                await auth.signOut();
                set({ user: null, isAuthenticated: false, orders: [] });
            },

            addOrder: async (orderData) => {
                try {
                    let finalProofUrl = orderData.paymentProof;

                    // If proof is a base64 string, upload to Storage
                    if (orderData.paymentMethod === 'Online' && orderData.paymentProof?.startsWith('data:image')) {
                        const storageRef = ref(storage, `payment-proofs/${Date.now()}-${orderData.orderId}.jpg`);
                        await uploadString(storageRef, orderData.paymentProof, 'data_url');
                        finalProofUrl = await getDownloadURL(storageRef);
                    }

                    const ordersCol = collection(db, 'orders');
                    const timestamp = new Date().toISOString();
                    
                    const docRef = await addDoc(ordersCol, {
                        ...orderData,
                        paymentProof: finalProofUrl || '',
                        createdAt: timestamp,
                        updatedAt: timestamp
                    });

                    return { 
                        id: docRef.id, 
                        ...orderData, 
                        paymentProof: finalProofUrl,
                        createdAt: timestamp 
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
