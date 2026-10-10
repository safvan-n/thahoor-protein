import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type DeliveryZone } from '../types';
import { db } from '../lib/firebase';
import { 
    collection, 
    getDocs, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc 
} from 'firebase/firestore';

export const DEFAULT_ZONES: DeliveryZone[] = [
    {
        id: 'zone_kayamkulam_default',
        name: 'Kayamkulam Town',
        city: 'Kayamkulam',
        pincodes: ['690502'],
        deliveryFee: 0,
        isActive: true,
        note: 'Launch delivery zone'
    }
];

interface DeliveryZoneState {
    zones: DeliveryZone[];
    isLoading: boolean;
    fetchZones: () => Promise<void>;
    addZone: (zone: Omit<DeliveryZone, 'id'>) => Promise<void>;
    updateZone: (id: string, updates: Partial<DeliveryZone>) => Promise<void>;
    toggleZone: (id: string) => Promise<void>;
    deleteZone: (id: string) => Promise<void>;
    checkDeliveryAvailability: (pincode: string) => {
        isAvailable: boolean;
        matchedZone?: DeliveryZone;
        activeZones: DeliveryZone[];
    };
}

export const useDeliveryZoneStore = create<DeliveryZoneState>()(
    persist(
        (set, get) => ({
            zones: DEFAULT_ZONES,
            isLoading: false,

            fetchZones: async () => {
                set({ isLoading: true });
                try {
                    const zonesCol = collection(db, 'deliveryZones');
                    const snapshot = await getDocs(zonesCol);
                    
                    if (!snapshot.empty) {
                        const zoneList = snapshot.docs.map(d => ({
                            ...d.data(),
                            id: d.id,
                        })) as DeliveryZone[];
                        set({ zones: zoneList, isLoading: false });
                    } else {
                        // If no zones in Firestore yet, seed default zone or retain default
                        try {
                            const defaultZone = DEFAULT_ZONES[0];
                            const { id: _, ...zoneData } = defaultZone;
                            const docRef = await addDoc(zonesCol, zoneData);
                            set({ zones: [{ ...defaultZone, id: docRef.id }], isLoading: false });
                        } catch (seedErr) {
                            console.warn('Could not auto-seed default zone (read-only or offline):', seedErr);
                            set({ zones: DEFAULT_ZONES, isLoading: false });
                        }
                    }
                } catch (error) {
                    console.error('Failed to fetch delivery zones from Firestore:', error);
                    // Fall back to current or default zones
                    set((state) => ({ 
                        zones: state.zones.length > 0 ? state.zones : DEFAULT_ZONES, 
                        isLoading: false 
                    }));
                }
            },

            addZone: async (zoneData) => {
                try {
                    const zonesCol = collection(db, 'deliveryZones');
                    const docRef = await addDoc(zonesCol, zoneData);
                    const newZone: DeliveryZone = { ...zoneData, id: docRef.id };
                    set((state) => ({
                        zones: [...state.zones, newZone]
                    }));
                } catch (error) {
                    console.error('Failed to add delivery zone to Firestore:', error);
                    // Local fallback
                    const localZone: DeliveryZone = { ...zoneData, id: `zone_${Date.now()}` };
                    set((state) => ({
                        zones: [...state.zones, localZone]
                    }));
                }
            },

            updateZone: async (id, updates) => {
                try {
                    const zoneRef = doc(db, 'deliveryZones', id);
                    await updateDoc(zoneRef, updates);
                } catch (error) {
                    console.error('Failed to update delivery zone in Firestore:', error);
                }
                set((state) => ({
                    zones: state.zones.map((z) => (z.id === id ? { ...z, ...updates } : z))
                }));
            },

            toggleZone: async (id) => {
                const target = get().zones.find((z) => z.id === id);
                if (!target) return;
                const newStatus = !target.isActive;
                await get().updateZone(id, { isActive: newStatus });
            },

            deleteZone: async (id) => {
                try {
                    const zoneRef = doc(db, 'deliveryZones', id);
                    await deleteDoc(zoneRef);
                } catch (error) {
                    console.error('Failed to delete delivery zone from Firestore:', error);
                }
                set((state) => ({
                    zones: state.zones.filter((z) => z.id !== id)
                }));
            },

            checkDeliveryAvailability: (pincode: string) => {
                const cleanPin = pincode.replace(/\D/g, '').trim();
                const activeZones = get().zones.filter((z) => z.isActive);
                
                if (!cleanPin || cleanPin.length !== 6) {
                    return { isAvailable: false, activeZones };
                }

                const matchedZone = activeZones.find((z) =>
                    z.pincodes.some((pin) => pin.replace(/\D/g, '').trim() === cleanPin)
                );

                return {
                    isAvailable: !!matchedZone,
                    matchedZone,
                    activeZones
                };
            }
        }),
        {
            name: 'thahoor-delivery-zones-storage'
        }
    )
);
