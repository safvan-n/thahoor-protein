import { useUserStore } from '../store/userStore';
import { Package, Truck, CheckCircle, Clock, User, LogOut, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';

export function Profile() {
    const { user, orders, logout, isAuthenticated } = useUserStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/shop');
        } else if (user) {
            // Only fetch if user exists
            useUserStore.getState().fetchOrders(user.email);
        } else {
            // If authenticated but no user data (inconsistent state), force logout
            logout();
            navigate('/shop');
        }
    }, [isAuthenticated, navigate, user, logout]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleDeleteOrder = async (orderId: string) => {
        if (!window.confirm("Are you sure you want to delete this order from your history?")) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${orderId}?role=user`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // Refresh orders
                if (user) useUserStore.getState().fetchOrders(user.email);
            } else {
                alert("Failed to delete order");
            }
        } catch (error) {
            console.error("Error deleting order:", error);
            alert("Error deleting order");
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="container py-12 md:py-24">
            <div className="max-w-6xl mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12 border-b border-gray-100 pb-12"
                >
                    <div className="text-center md:text-left">
                        <span className="text-primary font-bold uppercase tracking-[0.4em] text-[10px] mb-4 block">Patron's Lounge</span>
                        <h1 className="text-4xl md:text-6xl font-serif font-black text-gray-900 tracking-tighter">Your Account</h1>
                    </div>
                    
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-gray-400 hover:text-red-600 font-bold uppercase tracking-widest text-[10px] transition-all group"
                    >
                        <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Log Out From Archive
                    </button>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* User Profile Card */}
                    <div className="lg:col-span-4">
                        <div className="bg-white border border-gray-100 p-8 md:p-10 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 -mr-12 -mt-12 rounded-full group-hover:scale-110 transition-transform duration-700"></div>
                            
                            <div className="relative z-10">
                                <div className="w-20 h-20 bg-gray-900 text-white rounded-none flex items-center justify-center mb-8 shadow-2xl">
                                    <User size={32} />
                                </div>
                                
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-3 block">Identity</span>
                                <h2 className="text-3xl font-serif font-black text-gray-900 mb-2">{user.name}</h2>
                                <p className="text-gray-400 font-medium tracking-tight mb-8">{user.email}</p>

                                <div className="pt-8 border-t border-gray-50">
                                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">
                                        <span>Status</span>
                                        <span className="text-green-600">Active Member</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                        <span>Join Date</span>
                                        <span className="text-gray-900">Premium Tier</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order History */}
                    <div className="lg:col-span-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-serif font-black text-gray-900 tracking-tight flex items-center gap-4">
                                <Package className="text-primary" size={24} /> 
                                Purchase Archive
                            </h2>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                {orders.length} Selection(s)
                            </span>
                        </div>

                        {(!orders || orders.length === 0) ? (
                            <div className="bg-gray-50 border border-dashed border-gray-200 py-24 text-center rounded-none group">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                    <Package className="text-gray-300" size={32} />
                                </div>
                                <p className="text-gray-400 font-serif italic text-xl">The archive is currently empty.</p>
                                <button className="mt-8 text-primary font-bold uppercase tracking-widest text-[10px] hover:underline">Start Your Collection</button>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {orders.map((order) => (
                                    <motion.div 
                                        key={order.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        className="bg-white border border-gray-100 shadow-sm relative group overflow-hidden"
                                    >
                                        {/* Status Header */}
                                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 bg-gray-50/50">
                                            <div className="flex items-center gap-4">
                                                <span className={`w-2 h-2 rounded-full animate-pulse ${
                                                    order.status === 'Delivered' ? 'bg-green-500' :
                                                    order.status === 'On the Way' ? 'bg-blue-500' : 'bg-primary'
                                                }`}></span>
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900">
                                                    {order.status || 'Order Placed'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-gray-400">
                                                <span className="text-[10px] font-bold uppercase tracking-widest">#{order.orderId || order.id?.slice(-8)}</span>
                                                <button
                                                    onClick={() => handleDeleteOrder(order.id)}
                                                    className="p-1 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="p-8">
                                            <div className="flex flex-col md:flex-row justify-between gap-8 mb-10">
                                                <div className="space-y-4">
                                                    <p className="text-xs text-gray-500 flex items-center gap-2">
                                                        <Clock size={14} />
                                                        Archived on {new Date(order.createdAt || (order as any).date || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </p>
                                                    <div className="grid grid-cols-1 gap-2">
                                                        {order.items?.map((item, idx) => (
                                                            <div key={idx} className="flex items-center gap-4 group/item">
                                                                <span className="text-primary font-serif italic text-lg leading-none">x{item.qty}kg</span>
                                                                <span className="text-gray-900 font-bold uppercase tracking-tighter text-sm group-hover/item:translate-x-1 transition-transform">{item.name}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                
                                                <div className="text-left md:text-right border-t md:border-t-0 md:border-l border-gray-50 pt-8 md:pt-0 md:pl-12">
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.4em] mb-2 block">Premium Value</span>
                                                    <p className="text-4xl font-serif font-black text-gray-900 leading-none tracking-tighter">₹{(order.totalAmount || (order as any).total || 0).toFixed(0)}</p>
                                                    {order.paymentMethod && (
                                                        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-300 mt-4 block">{order.paymentMethod} Payment</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Minimalist Progress Meter */}
                                            <div className="relative pt-6">
                                                <div className="absolute top-0 left-0 w-full h-[1px] bg-gray-100"></div>
                                                <div className="absolute top-0 left-0 h-[3px] bg-primary transition-all duration-1000 -translate-y-[1px]"
                                                    style={{ width: order.status === 'Delivered' ? '100%' : order.status === 'On the Way' ? '50%' : '15%' }}></div>
                                                
                                                <div className="flex justify-between text-[8px] font-black uppercase tracking-[0.3em] text-gray-300 pt-4">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Package size={12} className={order.status ? 'text-gray-900' : 'text-primary'} />
                                                        <span className={order.status ? 'text-gray-900' : 'text-primary'}>Curated</span>
                                                    </div>
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Truck size={12} className={order.status === 'On the Way' ? 'text-primary' : 'text-gray-300'} />
                                                        <span className={order.status === 'On the Way' ? 'text-primary' : order.status === 'Delivered' ? 'text-gray-900' : ''}>Transit</span>
                                                    </div>
                                                    <div className="flex flex-col items-center gap-2">
                                                        <CheckCircle size={12} className={order.status === 'Delivered' ? 'text-green-600' : 'text-gray-300'} />
                                                        <span className={order.status === 'Delivered' ? 'text-green-600' : ''}>Delivered</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
