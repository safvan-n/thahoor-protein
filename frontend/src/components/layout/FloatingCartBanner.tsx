import { ShoppingBag, ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { motion, AnimatePresence } from 'framer-motion';

export function FloatingCartBanner() {
    const location = useLocation();
    const { items, total } = useCartStore();
    const itemCount = items.length;
    const totalPrice = total();

    // Do not show on cart page, checkout, or admin / delivery dashboards
    const isCartPage = location.pathname === '/cart';
    const isAdminOrDelivery = location.pathname.startsWith('/admin') || location.pathname.startsWith('/delivery');

    if (itemCount === 0 || isCartPage || isAdminOrDelivery) {
        return null;
    }

    const totalWeightKg = items.reduce((sum, item) => sum + (item.qtyKg || 1), 0);

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="md:hidden fixed bottom-[72px] left-4 right-4 z-40 pointer-events-auto"
            >
                <Link
                    to="/cart"
                    className="flex items-center justify-between bg-[#121214] text-white px-4 py-3 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.35)] border border-primary/30 group active:scale-[0.98] transition-all"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold shadow-md">
                            <ShoppingBag size={18} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-white">
                                    {itemCount} {itemCount === 1 ? 'Cut' : 'Cuts'}
                                </span>
                                <span className="text-[10px] text-gray-400 font-medium">
                                    ({totalWeightKg} kg)
                                </span>
                            </div>
                            <div className="text-sm font-serif font-black text-primary-light">
                                ₹{totalPrice.toFixed(0)}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 bg-primary px-3.5 py-2 rounded-xl text-white text-xs font-black uppercase tracking-wider shadow-sm group-hover:bg-primary-dark transition-colors">
                        <span>Checkout</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                </Link>
            </motion.div>
        </AnimatePresence>
    );
}
