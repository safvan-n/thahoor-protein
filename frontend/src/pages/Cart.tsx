import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Scale, Minus, Plus, PhoneCall } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { Link } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { AuthModal } from '../components/auth/AuthModal';
import { CheckoutModal } from '../components/checkout/CheckoutModal';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Cart() {
    const { items, removeFromCart, updateQty, total, clearCart } = useCartStore();
    const totalPrice = total();

    const { isAuthenticated, addOrder, user } = useUserStore();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);

    const handleCheckout = () => {
        if (!isAuthenticated) {
            setShowAuthModal(true);
        } else {
            setShowCheckout(true);
        }
    };

    const handleConfirmOrder = async (details: { name: string; phone: string; address: any; location: any; paymentMethod: 'COD'; paymentProof?: string }) => {
        const newOrder: any = {
            orderId: 'ORD-' + Date.now().toString().slice(-6),
            status: 'Placed',
            totalAmount: totalPrice,
            items: items.map(i => ({ name: i.name, qty: i.qtyKg, price: i.pricePerKg })),
            customer: {
                name: details.name || user?.name || 'Guest',
                email: user?.email || 'guest@example.com',
                phone: details.phone,
                address: details.address,
                location: details.location
            },
            paymentMethod: details.paymentMethod,
            paymentProof: details.paymentProof
        };

        try {
            await addOrder(newOrder);

            const addressText = `%0A%0A*Delivery Details:*%0AName: ${details.name}%0APhone: ${details.phone}%0AAddress: ${details.address.street}, ${details.address.city} - ${details.address.pincode}%0ALandmark: ${details.address.landmark || ''}`;

            let locationText = '';
            if (details.location) {
                locationText = `%0A%0A*📍 Location:* https://www.google.com/maps/search/?api=1&query=${details.location.lat},${details.location.lng}`;
            }

            const orderItems = items.map(i => `- ${i.name}: ${i.qtyKg}kg @ ₹${i.pricePerKg}/kg = ₹${i.qtyKg * i.pricePerKg}`).join('%0A');
            const totalText = `%0A*Total Estimate: ₹${totalPrice}*`;

            const paymentText = `%0A*Payment Method:* ${details.paymentMethod}`;
            const userText = `%0A%0A*Customer:* ${user?.name || details.name}`;

            const text = `*New App Order* 📦%0A%0A${orderItems}${totalText}${paymentText}${userText}${addressText}${locationText}%0A%0APlease confirm delivery time.`;

            window.open(`https://wa.me/918075575472?text=${text}`, '_blank');

            clearCart();
            setShowCheckout(false);

        } catch (error) {
            console.error("Order failed:", error);
            alert("Failed to place order. Please try again or contact support.");
        }
    };

    if (items.length === 0) {
        return (
            <div className="min-h-[75vh] bg-[#fcfbfa] flex items-center justify-center px-4 py-16">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center max-w-md w-full bg-white p-8 sm:p-12 rounded-3xl border border-gray-100 shadow-xl"
                >
                    <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
                        <ShoppingBag size={36} />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-black text-gray-900 mb-2 tracking-tight">Your Cart is Empty</h2>
                    <p className="text-gray-500 text-xs sm:text-sm font-light mb-8 leading-relaxed">
                        Add fresh chicken, mutton, or specialty butchery cuts to your basket to place an order.
                    </p>
                    <Link 
                        to="/shop" 
                        className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 bg-primary hover:bg-primary-dark text-white font-bold uppercase tracking-wider text-xs rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
                    >
                        <span>Explore Fresh Cuts</span>
                        <ArrowRight size={15} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    const totalWeightKg = items.reduce((sum, item) => sum + item.qtyKg, 0);

    return (
        <div className="min-h-screen bg-[#fcfbfa] pt-6 sm:pt-12 md:pt-16 pb-36">
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
            <CheckoutModal
                isOpen={showCheckout}
                onClose={() => setShowCheckout(false)}
                onSubmit={handleConfirmOrder}
                totalAmount={totalPrice}
            />

            <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
                
                {/* Header */}
                <header className="mb-6 sm:mb-10 border-b border-gray-200 pb-4 sm:pb-6 flex items-end justify-between">
                    <div>
                        <div className="text-primary text-[10px] font-bold uppercase tracking-[0.3em] mb-1">
                            Fresh Selection
                        </div>
                        <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif font-black text-gray-900 tracking-tight">
                            Your Order <span className="text-primary italic">Cart.</span>
                        </h1>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-gray-400">
                        {items.length} {items.length === 1 ? 'item' : 'items'} • {totalWeightKg} kg
                    </span>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
                    
                    {/* Items List Column */}
                    <div className="lg:col-span-7 space-y-3 sm:space-y-4">
                        <AnimatePresence mode="popLayout">
                            {items.map((item) => (
                                <motion.div 
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white p-3.5 sm:p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3.5 sm:gap-5"
                                >
                                    {/* Thumbnail */}
                                    <div className="relative w-18 h-18 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                                        <img 
                                            src={item.image} 
                                            alt={item.name} 
                                            className="w-full h-full object-cover" 
                                        />
                                    </div>

                                    {/* Item Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <h3 className="font-serif font-bold text-sm sm:text-lg text-gray-900 truncate">
                                                {item.name}
                                            </h3>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                aria-label="Remove item"
                                                className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        <p className="text-[11px] text-gray-400 font-medium mb-3">
                                            ₹{item.pricePerKg} per kg
                                        </p>

                                        {/* Stepper & Line Price */}
                                        <div className="flex items-center justify-between gap-2">
                                            {/* Quantity Controller */}
                                            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-0.5">
                                                <button 
                                                    onClick={() => updateQty(item.id, Math.max(0.5, item.qtyKg - 0.5))}
                                                    className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-white rounded active:scale-90 transition-all"
                                                >
                                                    <Minus size={12} />
                                                </button>
                                                
                                                <span className="text-xs font-black text-gray-900 px-2 min-w-[50px] text-center">
                                                    {item.qtyKg} kg
                                                </span>

                                                <button 
                                                    onClick={() => updateQty(item.id, item.qtyKg + 0.5)}
                                                    className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-white rounded active:scale-90 transition-all"
                                                >
                                                    <Plus size={12} />
                                                </button>
                                            </div>

                                            <div className="text-right">
                                                <div className="text-base sm:text-lg font-serif font-black text-gray-900 leading-none">
                                                    ₹{(item.pricePerKg * item.qtyKg).toFixed(0)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Fast Phone Support Help */}
                        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                                    <PhoneCall size={18} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-900">Custom Cut Requirement?</p>
                                    <p className="text-[10px] text-gray-500">Call butcher directly for special trimming</p>
                                </div>
                            </div>
                            <a 
                                href="tel:8075575472" 
                                className="px-3 py-1.5 bg-white border border-primary/20 text-primary text-xs font-bold rounded-lg shadow-sm"
                            >
                                Call
                            </a>
                        </div>
                    </div>

                    {/* Desktop Order Summary Column */}
                    <div className="lg:col-span-5">
                        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xl sticky top-24">
                            <h3 className="text-lg sm:text-xl font-serif font-black mb-6 text-gray-900 border-b border-gray-100 pb-4">
                                Order Summary
                            </h3>
                            
                            <div className="space-y-4 mb-6 text-xs sm:text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Total Cuts Selected</span>
                                    <span className="font-bold text-gray-900">{items.length} items ({totalWeightKg} kg)</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Delivery Status</span>
                                    <span className="text-emerald-600 font-bold">45-min Priority Express</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Payment Option</span>
                                    <span className="font-bold text-gray-900">Cash on Delivery (COD)</span>
                                </div>
                                
                                <div className="h-[1px] bg-gray-100 my-4"></div>
                                
                                <div className="flex justify-between items-baseline pt-2">
                                    <span className="font-bold text-gray-900 text-sm">Estimated Total</span>
                                    <span className="text-3xl font-serif font-black text-primary">
                                        ₹{totalPrice.toFixed(0)}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-bold uppercase tracking-wider text-xs rounded-xl shadow-xl shadow-primary/25 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <span>Proceed To Checkout</span>
                                <ArrowRight size={16} />
                            </button>

                            <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                                <div className="flex items-center gap-1.5">
                                    <ShieldCheck size={14} className="text-primary" />
                                    <span>100% Halal Certified</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Scale size={14} className="text-primary" />
                                    <span>Precision Weighed</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Fixed Sticky Checkout Footer Bar */}
            <div className="lg:hidden fixed bottom-[64px] left-0 right-0 z-30 bg-white/95 backdrop-blur-xl border-t border-gray-200 px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
                <div className="container mx-auto flex items-center justify-between gap-4">
                    <div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Amount</div>
                        <div className="text-xl font-serif font-black text-primary leading-none">
                            ₹{totalPrice.toFixed(0)}
                        </div>
                    </div>

                    <button
                        onClick={handleCheckout}
                        className="flex-1 max-w-[220px] py-3.5 px-4 bg-primary hover:bg-primary-dark text-white font-bold uppercase tracking-wider text-xs rounded-xl shadow-lg shadow-primary/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                        <span>Checkout</span>
                        <ArrowRight size={15} />
                    </button>
                </div>
            </div>

        </div>
    );
}
