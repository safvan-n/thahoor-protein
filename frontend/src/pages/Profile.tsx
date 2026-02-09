import { useUserStore } from '../store/userStore';
import { Package, Truck, CheckCircle, Clock, User, LogOut, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

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
        <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User Info Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                        <div className="flex flex-col items-center">
                            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
                                <User size={48} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
                            <p className="text-gray-500 mb-8">{user.email}</p>

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 text-red-600 font-medium py-3 px-6 rounded-xl border-2 border-red-50 hover:bg-red-50 transition-colors"
                            >
                                <LogOut size={20} />
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>

                {/* Orders Section */}
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                        <Package className="text-primary" /> Order History
                    </h2>

                    {(!orders || orders.length === 0) ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300">
                            <Package className="mx-auto text-gray-300 mb-4" size={48} />
                            <p className="text-gray-500 text-lg">No orders yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {orders.map((order) => (
                                <div key={order._id || Math.random()} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative group">
                                    {/* Delete Button */}
                                    <button
                                        onClick={() => handleDeleteOrder(order._id)}
                                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors z-20"
                                        title="Delete from History"
                                    >
                                        <Trash2 size={18} />
                                    </button>

                                    <div className="p-6">
                                        <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="font-bold text-lg text-gray-800">Order #{order.orderId || order._id?.slice(-6) || 'NM-' + Math.random().toString(36).substr(2, 4)}</span>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide 
                                                        ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                            order.status === 'On the Way' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-yellow-100 text-yellow-700'}`}>
                                                        {order.status || 'Placed'}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                                    <Clock size={14} />
                                                    {new Date(order.createdAt || (order as any).date || Date.now()).toLocaleDateString()} at {new Date(order.createdAt || (order as any).date || Date.now()).toLocaleTimeString()}
                                                </p>
                                                {order.customer?.address ? (
                                                    <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg inline-block">
                                                        <span className="font-bold text-gray-700">Delivery to:</span> {order.customer.address.street || ''}, {order.customer.address.city || ''}
                                                    </div>
                                                ) : null}
                                            </div>
                                            <div className="text-right mr-10">
                                                <p className="text-sm text-gray-500">Total Amount</p>
                                                <p className="font-bold text-xl text-primary">₹{(order.totalAmount || (order as any).total || 0).toFixed(0)}</p>
                                            </div>
                                        </div>

                                        {/* Progress Tracker (Visual Mockup) */}
                                        <div className="relative mb-8 px-2">
                                            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 rounded-full"></div>
                                            <div className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 rounded-full transition-all duration-1000"
                                                style={{ width: order.status === 'Delivered' ? '100%' : order.status === 'On the Way' ? '66%' : '33%' }}></div>

                                            <div className="relative flex justify-between">
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center z-10 shadow-sm border-2 border-white">
                                                        <Package size={14} />
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-600">Placed</span>
                                                </div>
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 shadow-sm border-2 border-white 
                                                        ${['On the Way', 'Delivered'].includes(order.status) ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'}`}>
                                                        <Truck size={14} />
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-600">On Way</span>
                                                </div>
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 shadow-sm border-2 border-white 
                                                        ${order.status === 'Delivered' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                                        <CheckCircle size={14} />
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-600">Delivered</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Items Ordered</h4>
                                            <ul className="space-y-2">
                                                {order.items && order.items.length > 0 ? (
                                                    order.items.map((item, idx) => (
                                                        <li key={idx} className="flex justify-between text-sm text-gray-600">
                                                            <span>{item.name}</span>
                                                            <span className="font-medium">x {item.qty}kg</span>
                                                        </li>
                                                    ))
                                                ) : (
                                                    <li className="text-sm text-gray-500">No items found</li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
