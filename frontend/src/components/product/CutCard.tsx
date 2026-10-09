import { Plus, Minus, Check } from 'lucide-react';
import { type Cut } from '../../types';
import { useCartStore } from '../../store/cartStore';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CutCardProps {
    cut: Cut;
}

export function CutCard({ cut }: CutCardProps) {
    const { items, addToCart, updateQty, removeFromCart } = useCartStore();
    const cartItem = items.find(i => i.id === cut.id);
    const inCartQty = cartItem ? cartItem.qtyKg : 0;

    const [showConfirm, setShowConfirm] = useState(false);

    const handleFirstAdd = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (cut.isAvailable === false) return;
        addToCart(cut, 1);
        setShowConfirm(true);
        setTimeout(() => setShowConfirm(false), 1200);
    };

    const handleIncrease = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (cartItem) {
            updateQty(cut.id, cartItem.qtyKg + 0.5);
        } else {
            addToCart(cut, 1);
        }
    };

    const handleDecrease = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (cartItem) {
            if (cartItem.qtyKg <= 0.5) {
                removeFromCart(cut.id);
            } else {
                updateQty(cut.id, cartItem.qtyKg - 0.5);
            }
        }
    };

    const isAvailable = cut.isAvailable !== false;

    return (
        <motion.div 
            whileTap={{ scale: 0.98 }}
            className={`group relative flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 ${
                !isAvailable ? 'opacity-70' : ''
            }`}
        >
            {/* Image Container */}
            <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden bg-gray-100">
                <img
                    src={cut.image}
                    alt={cut.name}
                    loading="lazy"
                    className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
                        !isAvailable ? 'grayscale contrast-75' : ''
                    }`}
                />

                {/* Top Fresh Badge */}
                <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
                    {isAvailable ? (
                        <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[9px] font-bold tracking-wider flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            Fresh
                        </span>
                    ) : (
                        <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-bold tracking-wider uppercase">
                            Out of Stock
                        </span>
                    )}
                </div>

                {/* Subtle Gradient Overlay */}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>

                {/* Added Confirmation Overlay */}
                <AnimatePresence>
                    {showConfirm && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute inset-0 z-30 bg-primary/95 flex flex-col items-center justify-center text-white"
                        >
                            <div className="w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center mb-1 shadow-lg">
                                <Check size={20} strokeWidth={3} />
                            </div>
                            <span className="text-xs font-black uppercase tracking-wider">Added to Cart!</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Cut Details */}
            <div className="flex-1 flex flex-col p-3 sm:p-4">
                <div className="flex-1">
                    <h3 className="font-serif font-black text-gray-900 text-sm sm:text-base leading-snug group-hover:text-primary transition-colors line-clamp-1 mb-1">
                        {cut.name}
                    </h3>
                    <p className="text-[11px] text-gray-500 line-clamp-1 font-light mb-3">
                        {cut.description || 'Premium butchery cut, fresh & cleaned'}
                    </p>
                </div>

                {/* Price and Cart Action */}
                <div className="pt-2 border-t border-gray-50 flex items-center justify-between gap-2 mt-auto">
                    <div>
                        <div className="text-primary font-black text-base sm:text-lg leading-none tracking-tight">
                            ₹{cut.pricePerKg}
                        </div>
                        <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                            per kg
                        </div>
                    </div>

                    {/* Action Buttons: Add or Qty Controller */}
                    {isAvailable ? (
                        inCartQty > 0 ? (
                            <div className="flex items-center bg-gray-900 text-white rounded-full p-1 shadow-md">
                                <button
                                    type="button"
                                    onClick={handleDecrease}
                                    aria-label="Decrease quantity"
                                    className="w-7 h-7 rounded-full hover:bg-gray-800 flex items-center justify-center text-white active:scale-90 transition-transform"
                                >
                                    <Minus size={13} />
                                </button>
                                <span className="px-2 text-xs font-black min-w-[36px] text-center">
                                    {inCartQty}k
                                </span>
                                <button
                                    type="button"
                                    onClick={handleIncrease}
                                    aria-label="Increase quantity"
                                    className="w-7 h-7 rounded-full bg-primary hover:bg-primary-dark flex items-center justify-center text-white active:scale-90 transition-transform"
                                >
                                    <Plus size={13} />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={handleFirstAdd}
                                className="px-3.5 sm:px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl sm:rounded-full font-bold text-xs flex items-center gap-1.5 shadow-md shadow-primary/20 transition-all active:scale-95"
                            >
                                <Plus size={14} strokeWidth={2.5} />
                                <span>Add</span>
                            </button>
                        )
                    ) : (
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                            Sold Out
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
