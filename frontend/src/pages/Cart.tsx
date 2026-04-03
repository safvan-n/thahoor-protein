import { Trash2 } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { Link } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { AuthModal } from '../components/auth/AuthModal';
import { CheckoutModal } from '../components/checkout/CheckoutModal';
import { useState } from 'react';

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
        // Add to Order History
        const newOrder: any = {
            orderId: 'ORD-' + Date.now().toString().slice(-6),
            // date: new Date().toISOString(), // Backend handles timestamps
            status: 'Placed',
            totalAmount: totalPrice,
            items: items.map(i => ({ name: i.name, qty: i.qtyKg, price: i.pricePerKg })),
            customer: {
                name: details.name || user?.name || 'Guest',
                email: user?.email || 'guest@example.com', // Fallback if user logic is loose
                phone: details.phone,
                address: details.address,
                location: details.location
            },
            paymentMethod: details.paymentMethod,
            paymentProof: details.paymentProof
        };

        try {
            const savedOrder: any = await addOrder(newOrder);

            // Generate WhatsApp Text
            const addressText = `%0A%0A*Delivery Details:*%0AName: ${details.name}%0APhone: ${details.phone}%0AAddress: ${details.address.street}, ${details.address.city} - ${details.address.pincode}%0ALandmark: ${details.address.landmark || ''}`;

            let locationText = '';
            if (details.location) {
                locationText = `%0A%0A*📍 Location:* https://www.google.com/maps/search/?api=1&query=${details.location.lat},${details.location.lng}`;
            }

            const orderItems = items.map(i => `- ${i.name}: ${i.qtyKg}kg @ ₹${i.pricePerKg}/kg = ₹${i.qtyKg * i.pricePerKg}`).join('%0A');
            const totalText = `%0A*Total Estimate: ₹${totalPrice}*`;

            // Payment Info with Proof Link
            let paymentText = `%0A*Payment Method:* ${details.paymentMethod}`;
            if (details.paymentMethod === 'Online' && savedOrder?.paymentProof) {
                paymentText += `%0A*Payment Proof:* ${savedOrder.paymentProof}`;
            }

            const userText = `%0A%0A*Customer:* ${user?.name || details.name}`;

            const text = `*New App Order* 📦%0A%0A${orderItems}${totalText}${paymentText}${userText}${addressText}${locationText}%0A%0APlease confirm.`;

            // Open WhatsApp
            window.open(`https://wa.me/918075575472?text=${text}`, '_blank');

            // Clear cart after successful checkout
            clearCart();
            setShowCheckout(false);

        } catch (error) {
            console.error("Order failed:", error);
            alert("Failed to place order. Please try again or contact support.");
        }
    };

    if (items.length === 0) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-gray-400 mb-4">Your cart is empty</h2>
                <Link to="/shop" className="text-primary font-medium hover:underline">Start Shopping</Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
            <CheckoutModal
                isOpen={showCheckout}
                onClose={() => setShowCheckout(false)}
                onSubmit={handleConfirmOrder}
                totalAmount={totalPrice}
            />
            <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="p-6 space-y-6">
                    {items.map((item) => (
                        <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b last:border-0 last:pb-0">
                            <div className="flex items-center gap-4">
                                <img src={item.image} alt={item.name} className="w-16 h-16 rounded-md object-cover" />
                                <div>
                                    <h3 className="font-bold text-lg">{item.name}</h3>
                                    <p className="text-gray-500 text-sm">₹{item.pricePerKg}/kg</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="flex items-center border rounded-md">
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0.5"
                                        value={item.qtyKg}
                                        onChange={(e) => updateQty(item.id, parseFloat(e.target.value) || 0.5)}
                                        className="w-16 text-center py-1 outline-none"
                                    />
                                    <span className="pr-2 text-sm text-gray-500">kg</span>
                                </div>

                                <div className="font-bold w-24 text-right">
                                    ₹{(item.pricePerKg * item.qtyKg).toFixed(0)}
                                </div>

                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="text-red-500 hover:text-red-700 p-2"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-gray-50 p-6 flex flex-col items-end space-y-4">
                    <div className="flex justify-between w-full max-w-sm text-lg">
                        <span className="font-medium text-gray-600">Total Estimate</span>
                        <span className="font-bold text-2xl">₹{totalPrice.toFixed(0)}</span>
                    </div>

                    <button
                        onClick={handleCheckout}
                        className="w-full max-w-sm py-4 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-xl"
                    >
                        Proceed to Checkout
                    </button>
                    <p className="text-xs text-stone-500 max-w-sm text-center">
                        *Final price may vary slightly based on exact weight at checkout.
                    </p>
                </div>
            </div>
        </div>
    );
}
