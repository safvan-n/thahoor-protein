export interface Category {
    id: string;
    name: string;
    description?: string;
    image: string;
}

export interface Cut {
    id: string;
    categoryId: string;
    name: string;
    description: string;
    pricePerKg: number;
    image: string;
    secondaryImage?: string;
    isAvailable?: boolean;
}

export interface CartItem extends Cut {
    qtyKg: number;
}

export interface DeliveryZone {
    id: string;
    name: string;
    city: string;
    pincodes: string[];
    deliveryFee: number;
    isActive: boolean;
    note?: string;
}
