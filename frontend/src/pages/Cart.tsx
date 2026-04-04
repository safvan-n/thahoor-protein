import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Scale } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { Link } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { AuthModal } from '../components/auth/AuthModal';
import { CheckoutModal } from '../components/checkout/CheckoutModal';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Cart() {
    const { items, removeFromCart, updateQty, total } = useCartStore();
    const totalPrice = total();

    const { isAuthenticated, addOrder, user } = useUserStore();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const clearCart = useCartStore(state => state.clearCart);

    const [showCheckout, setShowCheckout] = useState(false);

    const handleCheckout = () => {
        if (!isAuthenticated) {
            setShowAuthModal(true);
        } else {
            setShowCheckout(true);
        }
    };

    const handleConfirmOrder = async (details: { name: string; phone: string; address: any; location: any; paymentMethod: 'COD' | 'Online'; paymentProof?: string }) => {
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
            const savedOrder: any = await addOrder(newOrder);

            const addressText = `%0A%0A*Delivery Details:*%0AName: ${details.name}%0APhone: ${details.phone}%0AAddress: ${details.address.street}, ${details.address.city} - ${details.address.pincode}%0ALandmark: ${details.address.landmark || ''}`;

            let locationText = '';
            if (details.location) {
                locationText = `%0A%0A*📍 Location:* https://www.google.com/maps/search/?api=1&query=${details.location.lat},${details.location.lng}`;
            }

            const orderItems = items.map(i => `- ${i.name}: ${i.qtyKg}kg @ ₹${i.pricePerKg}/kg = ₹${i.qtyKg * i.pricePerKg}`).join('%0A');
            const totalText = `%0A*Total Estimate: ₹${totalPrice}*`;

            let paymentText = `%0A*Payment Method:* ${details.paymentMethod}`;
            if (details.paymentMethod === 'Online' && savedOrder?.paymentProof) {
                paymentText += `%0A*Payment Proof:* ${savedOrder.paymentProof}`;
            }

            const userText = `%0A%0A*Customer:* ${user?.name || details.name}`;

            const text = `*New App Order* 📦%0A%0A${orderItems}${totalText}${paymentText}${userText}${addressText}${locationText}%0A%0APlease confirm.`;

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
            <div className="min-h-screen bg-[#fcfcfa] flex items-center justify-center pt-20">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-lg px-6"
                >
                    <div className="w-24 h-24 bg-white shadow-2xl rounded-3xl flex items-center justify-center mx-auto mb-10 border border-gray-100 relative">
                        <ShoppingBag size={40} className="text-gray-200" />
                        <div className="absolute top-0 right-0 w-6 h-6 bg-primary animate-pulse rounded-full border-4 border-white"></div>
                    </div>
                    <h2 className="text-4xl font-serif font-black text-gray-900 mb-6 tracking-tighter">Your Selection is Empty.</h2>
                    <p className="text-gray-500 font-light mb-12 leading-relaxed">
                        Explore our heritage collections and select the finest cuts for your kitchen. Molecular purity starts with the first choice.
                    </p>
                    <Link 
                        to="/shop" 
                        className="inline-flex items-center gap-4 px-10 py-5 bg-gray-900 text-white font-black uppercase tracking-[0.3em] text-[10px] hover:bg-primary transition-all shadow-2xl active:scale-95"
                    >
                        Return to Collections <ArrowRight size={14} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fcfcfa] pt-24 md:pt-40 pb-32">
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
            <CheckoutModal
                isOpen={showCheckout}
                onClose={() => setShowCheckout(false)}
                onSubmit={handleConfirmOrder}
                totalAmount={totalPrice}
            />

            <div className="container mx-auto px-6 max-w-6xl">
                {/* Header - Resized For Mobile */}
                <header className="mb-12 border-b border-gray-200 pb-8 md:pb-12">
                    <div className="text-primary text-[10px] font-bold uppercase tracking-[0.5em] mb-4">Finalizing Selection</div>
                    <h1 className="text-3xl md:text-7xl font-serif font-black text-gray-900 tracking-tighter">
                        The Selection <span className="text-primary italic">Cart.</span>
                    </h1>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16">
                    {/* Items Column */}
                    <div className="lg:col-span-7 space-y-8 md:space-y-10">
                        <AnimatePresence mode="popLayout">
                            {items.map((item) => (
                                <motion.div 
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    className="group relative flex flex-col sm:flex-row gap-6 md:gap-8 pb-10 border-b border-gray-100 last:border-0"
                                >
                                    <div className="relative w-24 h-24 md:w-32 md:h-32 overflow-hidden shadow-xl shrink-0">
                                        <div className="absolute inset-0 z-10 border border-white/20 pointer-events-none"></div>
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700" />
                                    </div>

                                    <div className="flex-1 flex flex-col justify-between py-2">
                                        <div>
                                            <div className="flex items-center justify-between gap-4 mb-2">
                                                <h3 className="text-2xl font-serif font-black text-gray-900 group-hover:text-primary transition-colors">{item.name}</h3>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-6">Master Cut Selection</p>
                                        </div>

                                        <div className="flex flex-wrap items-center justify-between gap-6">
                                            <div className="flex items-center bg-white border border-gray-100 shadow-sm px-4 py-2">
                                                <label className="text-[8px] font-bold uppercase tracking-widest text-gray-400 mr-4">Weight:</label>
                                                <input
                                                    type="number"
                                                    step="0.5"
                                                    min="0.5"
                                                    value={item.qtyKg}
                                                    onChange={(e) => updateQty(item.id, parseFloat(e.target.value) || 0.5)}
                                                    className="w-12 text-sm font-bold text-gray-900 outline-none bg-transparent"
                                                />
                                                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest ml-2">kg</span>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400 mb-1">Total Weight Price</p>
                                                <p className="text-xl font-serif font-black text-gray-900">₹{(item.pricePerKg * item.qtyKg).toFixed(0)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Summary Column */}
                    <div className="lg:col-span-5 relative">
                        <div className="sticky top-40">
                            <div className="bg-white p-12 border border-gray-100 shadow-3xl relative overflow-hidden group">
                                {/* Corner Accent */}
                                <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-primary/20 group-hover:border-primary transition-colors"></div>
                                
                                <h3 className="text-2xl font-serif font-black mb-10 text-gray-900 border-b border-gray-50 pb-6 uppercase tracking-tighter">Order Curation</h3>
                                
                                <div className="space-y-6 mb-12">
                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                        <span className="text-gray-400">Total Selection Items</span>
                                        <span className="text-gray-900">{items.reduce((acc, i) => acc + i.qtyKg, 0)} kg</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                        <span className="text-gray-400">Logistics Protocol</span>
                                        <span className="text-primary italic">Priority Express</span>
                                    </div>
                                    <div className="h-[1px] bg-gray-50"></div>
                                    <div className="flex justify-between items-end pt-4">
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Final Selection Total</div>
                                        <div className="text-4xl font-serif font-black text-primary tracking-tighter">₹{totalPrice.toFixed(0)}</div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    className="w-full py-6 bg-gray-900 text-white font-black uppercase tracking-[0.3em] text-xs hover:bg-primary transition-all duration-300 shadow-2xl active:scale-95 flex items-center justify-center gap-4 group/btn"
                                >
                                    Proceed To Checkout <ArrowRight size={16} className="group-hover/btn:translate-x-2 transition-transform" />
                                </button>

                                <div className="mt-10 grid grid-cols-2 gap-4 pb-4">
                                    <div className="flex items-center gap-2 opacity-30 hover:opacity-100 transition-opacity">
                                        <ShieldCheck size={14} className="text-primary" />
                                        <span className="text-[8px] font-bold uppercase tracking-widest">Certified Origin</span>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-30 hover:opacity-100 transition-opacity">
                                        <Scale size={14} className="text-primary" />
                                        <span className="text-[8px] font-bold uppercase tracking-widest">Precision Weight</span>
                                    </div>
                                </div>
                                <p className="text-[10px] text-gray-400 font-light leading-relaxed italic border-t border-gray-50 pt-4">
                                    *Final price calculated during master butchery weighing at checkout hub.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
