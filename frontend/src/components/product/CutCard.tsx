import { ShoppingCart, ArrowUpRight } from 'lucide-react';
import { type Cut } from '../../types';
import { useCartStore } from '../../store/cartStore';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CutCardProps {
    cut: Cut;
}

export function CutCard({ cut }: CutCardProps) {
    const addToCart = useCartStore((state) => state.addToCart);

    const [showConfirm, setShowConfirm] = useState(false);
    const [showArrow, setShowArrow] = useState(false);
    const [clickPos, setClickPos] = useState({ x: 0, y: 0 });

    const handleAdd = (e: React.MouseEvent) => {
        // Record click position for the arrow
        setClickPos({ x: e.clientX, y: e.clientY });

        // Add to cart
        addToCart(cut, 1);

        // Trigger animations
        setShowConfirm(true);
        setShowArrow(true);

        // Reset animations
        setTimeout(() => setShowConfirm(false), 2000);
        setTimeout(() => setShowArrow(false), 1000);
    };

    return (
        <>
            <div className="bg-white group cursor-pointer relative">
                <div className="relative overflow-hidden mb-4">
                    <img
                        src={cut.image}
                        alt={cut.name}
                        className="w-full h-48 object-cover rounded shadow-sm group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Hover Overlay Button */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                            onClick={(e) => { e.stopPropagation(); handleAdd(e); }}
                            className="bg-primary text-white p-3 rounded-full hover:bg-red-800 transition-colors"
                        >
                            <ShoppingCart size={20} />
                        </button>
                    </div>
                </div>

                <div className="text-center">
                    <h3 className="font-bold text-gray-800 text-lg mb-1 group-hover:text-primary transition-colors">{cut.name}</h3>
                    <p className="text-primary font-bold">₹{cut.pricePerKg} / kg</p>
                </div>
            </div>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {showConfirm && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
                    >
                        <div className="bg-white p-4 rounded-3xl shadow-2xl border-4 border-primary/20">
                            <img
                                src="/assets/cart_confirm.jpg"
                                alt="Added to Cart"
                                className="w-64 h-auto rounded-xl"
                            />
                            <p className="text-center font-bold text-primary mt-2">Added to Cart!</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Flying Arrow Animation */}
            <AnimatePresence>
                {showArrow && (
                    <motion.div
                        initial={{ left: clickPos.x, top: clickPos.y, opacity: 1, scale: 1 }}
                        animate={{
                            left: window.innerWidth - 80, // Approximate cart position (top right)
                            top: 40,
                            opacity: 0,
                            scale: 0.5
                        }}
                        transition={{ duration: 0.8, ease: "easeIn" }}
                        className="fixed z-[100] text-primary pointer-events-none"
                    >
                        <ArrowUpRight size={48} strokeWidth={3} />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
