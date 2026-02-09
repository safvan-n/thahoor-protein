import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(__dirname, '../../data/orders.json');
const DATA_DIR = path.join(__dirname, '../../data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure db file exists
if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2));
}

export const getLocalOrders = () => {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

export const saveLocalOrder = (order: any) => {
    const orders = getLocalOrders();
    orders.unshift(order); // Add to top
    fs.writeFileSync(DB_PATH, JSON.stringify(orders, null, 2));
    return order;
};

export const updateLocalOrder = (id: string, updates: any) => {
    const orders = getLocalOrders();
    const index = orders.findIndex((o: any) => o._id === id || o.orderId === id);
    if (index !== -1) {
        orders[index] = { ...orders[index], ...updates };
        fs.writeFileSync(DB_PATH, JSON.stringify(orders, null, 2));
        return orders[index];
    }
    return null;
};

export const getLocalOrdersByUser = (email: string) => {
    const orders = getLocalOrders();
    return orders.filter((o: any) => o.customer?.email === email);
};

export const archiveLocalOrder = (id: string) => {
    let orders = getLocalOrders();
    const index = orders.findIndex((o: any) => o._id === id || o.orderId === id);
    if (index !== -1) {
        orders[index] = { ...orders[index], isArchived: true };
        fs.writeFileSync(DB_PATH, JSON.stringify(orders, null, 2));
        return true;
    }
    return false;
};

export const archiveLocalOrderForUser = (id: string) => {
    let orders = getLocalOrders();
    const index = orders.findIndex((o: any) => o._id === id || o.orderId === id);
    if (index !== -1) {
        orders[index] = { ...orders[index], isDeletedByUser: true };
        fs.writeFileSync(DB_PATH, JSON.stringify(orders, null, 2));
        return true;
    }
    return false;
};
