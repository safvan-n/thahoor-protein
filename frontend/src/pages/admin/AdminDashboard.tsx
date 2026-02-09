import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductStore } from '../../store/productStore';
import { Edit, Save, X, LogOut, Upload, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Cut } from '../../types';
import { io } from 'socket.io-client';

export function AdminDashboard() {
    const navigate = useNavigate();
    const { products, updateProduct } = useProductStore();
    const [editingProduct, setEditingProduct] = useState<Cut | null>(null);

    // Form states
    const [editPrice, setEditPrice] = useState<number>(0);
    const [editImage, setEditImage] = useState<string>('');

    const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
    const [orders, setOrders] = useState<any[]>([]);

    // Notification Sound
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Initialize Audio
        audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');

        const socket = io(import.meta.env.VITE_API_URL);

        socket.on('newOrder', (newOrder: any) => {
            // Play sound
            audioRef.current?.play().catch(e => console.log('Audio play failed:', e));

            // Update state
            setOrders(prev => [newOrder, ...prev]);
        });

        socket.on('orderDeleted', (deletedId: string) => {
            setOrders(prev => prev.filter(o => o._id !== deletedId));
        });

        // Listen for updates (status changes)
        socket.on('orderUpdated', (updatedOrder: any) => {
            setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        const isAdmin = localStorage.getItem('isAdmin');
        if (!isAdmin) {
            navigate('/admin');
        }
    }, [navigate]);

    useEffect(() => {
        if (activeTab === 'orders') {
            fetch(`${import.meta.env.VITE_API_URL}/api/orders/admin`)
                .then(res => res.json())
                .then(data => setOrders(data))
                .catch(err => console.error(err));
        }
    }, [activeTab]);

    const handleLogout = () => {
        localStorage.removeItem('isAdmin');
        navigate('/admin');
    };

    const handleUpdateStatus = async (orderId: string, status: string) => {
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            // State update handled by socket
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteOrder = async (orderId: string) => {
        if (!window.confirm("Are you sure you want to delete this order?")) return;

        try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${orderId}`, {
                method: 'DELETE',
            });
            // State update handled by socket
        } catch (error) {
            console.error("Failed to delete order:", error);
            alert("Failed to delete order");
        }
    };

    const handleWhatsAppDelivery = (order: any) => {
        const address = `${order.customer.address?.street}, ${order.customer.address?.city} - ${order.customer.address?.pincode} ${order.customer.address?.landmark ? '(' + order.customer.address.landmark + ')' : ''}`;
        const locationLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

        const text = `*New Delivery Assignment 🚛*%0A%0AOrder #${order.orderId || order._id.slice(-6)}%0ACustomer: *${order.customer.name}*%0APhone: ${order.customer.phone}%0A%0A*Address:*%0A${address}%0A%0A*Google Maps:*%0A${locationLink}%0A%0A*Items:*%0A${order.items.map((i: any) => `- ${i.name} (x${i.qty}kg)`).join('%0A')}%0A%0ATotal to Collect: *₹${order.totalAmount}*%0A%0APlease confirm pickup.`;
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    const saveProduct = () => {
        if (editingProduct) {
            updateProduct(editingProduct.id, {
                pricePerKg: editPrice,
                image: editImage
            });
            setEditingProduct(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
                <div className="mb-8 flex items-center gap-3 text-primary font-bold text-xl">
                    <span>Admin Panel</span>
                </div>

                <nav className="flex-1 space-y-2">
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'products' ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Edit size={20} /> Products
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'orders' ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Save size={20} /> Orders
                    </button>
                </nav>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-500 transition-colors mt-auto"
                >
                    <LogOut size={20} /> Logout
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8 overflow-y-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">{activeTab === 'products' ? 'Product Management' : 'Order Management'}</h1>
                    {activeTab === 'orders' && (
                        <button
                            onClick={() => {
                                fetch(`${import.meta.env.VITE_API_URL}/api/orders/admin`)
                                    .then(res => res.json())
                                    .then(data => setOrders(data));
                            }}
                            className="text-primary hover:bg-red-50 px-3 py-1 rounded-lg text-sm font-bold transition-colors"
                        >
                            Refresh List
                        </button>
                    )}
                </div>

                {activeTab === 'products' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product) => (
                            <motion.div
                                layout
                                key={product.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                            >
                                <div className="relative h-48 bg-gray-100">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-3 right-3 flex gap-2">
                                        <button
                                            onClick={() => {
                                                setEditingProduct(product);
                                                setEditPrice(product.pricePerKg);
                                                setEditImage(product.image);
                                            }}
                                            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white text-gray-700 shadow-sm transition-all"
                                        >
                                            <Edit size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-lg">{product.name}</h3>
                                            <p className="text-gray-500 text-sm">Category: {product.categoryId}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Daily Rate</p>
                                            <p className="font-bold text-xl text-primary">₹{product.pricePerKg}<span className="text-sm font-normal text-gray-400">/kg</span></p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    // Orders List
                    <div className="space-y-4">
                        {orders.map(order => (
                            <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative group">
                                <button
                                    onClick={() => handleDeleteOrder(order._id)}
                                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    title="Delete Order"
                                >
                                    <Trash2 size={18} />
                                </button>

                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg">Order #{order.orderId || order._id.slice(-6)}</h3>
                                        <div className="text-sm text-gray-600 mt-1">
                                            <p><span className="font-medium text-gray-800">{order.customer.name}</span> ({order.customer.phone})</p>
                                            <p className="text-xs text-gray-500 max-w-xs mt-0.5">
                                                {order.customer.address?.street}, {order.customer.address?.city} - {order.customer.address?.pincode}
                                                {order.customer.address?.landmark && <span className="block italic">Landmark: {order.customer.address.landmark}</span>}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mr-10">
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                                            className="px-3 py-1 rounded-full text-sm font-bold border border-gray-200 bg-gray-50 outline-none"
                                        >
                                            <option value="Placed">Placed</option>
                                            <option value="Confirmed">Confirmed</option>
                                            <option value="On the Way">On the Way</option>
                                            <option value="Delivered">Delivered</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-between items-end mt-4">
                                    <div>
                                        <p className="text-sm font-bold text-gray-700">Items:</p>
                                        <ul className="text-sm text-gray-600">
                                            {order.items.map((i: any, idx: number) => (
                                                <li key={idx}>{i.name} x {i.qty}kg</li>
                                            ))}
                                        </ul>

                                        {/* Payment Info */}
                                        <div className="mt-3">
                                            <p className="text-sm font-bold text-gray-700">Payment: <span className="font-normal">{order.paymentMethod}</span></p>
                                            {order.paymentMethod === 'Online' && (
                                                <a
                                                    href={`${import.meta.env.VITE_API_URL}/api/orders/${order._id}/proof`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-block mt-1 text-xs font-bold text-blue-600 hover:text-blue-800 underline"
                                                >
                                                    View Payment Proof
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-xl mb-2">₹{order.totalAmount}</p>
                                        <button
                                            onClick={() => handleWhatsAppDelivery(order)}
                                            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 flex items-center gap-2"
                                        >
                                            Send to Delivery Boy
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {editingProduct && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
                        onClick={() => setEditingProduct(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Edit Product</h3>
                                <button onClick={() => setEditingProduct(null)} className="text-gray-400 hover:text-gray-600">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                    <input
                                        type="text"
                                        value={editingProduct.name}
                                        disabled
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price per Kg (₹)</label>
                                    <input
                                        type="number"
                                        value={editPrice}
                                        onChange={(e) => setEditPrice(Number(e.target.value))}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>

                                    {/* Image Preview */}
                                    <div className="mb-3 h-48 w-full rounded-lg overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center relative group">
                                        {editImage ? (
                                            <>
                                                <img src={editImage} alt="Preview" className="w-full h-full object-contain" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <p className="text-white font-medium">Click "Upload" to change</p>
                                                </div>
                                            </>
                                        ) : (
                                            <p className="text-gray-400">No image</p>
                                        )}
                                    </div>

                                    {/* Upload Button */}
                                    <div className="flex gap-2">
                                        <label className="flex-1 cursor-pointer bg-white border border-gray-300 rounded-lg py-2.5 px-4 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                                            <Upload size={18} className="text-gray-600" />
                                            <span className="text-gray-700 font-medium">Upload New Image</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            setEditImage(reader.result as string);
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                        </label>
                                    </div>

                                    <div className="mt-3">
                                        <p className="text-xs text-center text-gray-500">
                                            OR paste an image URL below
                                        </p>
                                        <input
                                            type="text"
                                            value={editImage}
                                            onChange={(e) => setEditImage(e.target.value)}
                                            placeholder="https://example.com/image.jpg"
                                            className="w-full mt-2 px-3 py-2 text-sm rounded-md border border-gray-200 focus:ring-1 focus:ring-primary focus:border-transparent outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3 justify-end">
                                <button
                                    onClick={() => setEditingProduct(null)}
                                    className="px-6 py-2.5 rounded-lg border border-gray-300 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveProduct}
                                    className="px-6 py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-red-800 transition-colors flex items-center gap-2"
                                >
                                    <Save size={18} />
                                    Save Changes
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
