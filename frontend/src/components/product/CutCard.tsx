import { ShoppingCart, Star, Plus } from 'lucide-react';
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
    const [isHovered, setIsHovered] = useState(false);

    const handleAdd = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (cut.isAvailable === false) return;

        // Add to cart
        addToCart(cut, 1);

        // Trigger animations
        setShowConfirm(true);

        // Reset animations
        setTimeout(() => setShowConfirm(false), 2000);
    };

    return (
        <div 
            className="group relative cursor-pointer flex flex-col h-full bg-white transition-all duration-500"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Image Container with Art Curation Frame */}
            <div className="relative aspect-[4/5] overflow-hidden mb-8 shadow-sm group-hover:shadow-2xl transition-all duration-700">
                <div className="absolute inset-0 z-10 p-4 border border-white/20 pointer-events-none group-hover:border-primary/20 transition-all duration-500"></div>
                
                <img
                    src={cut.image}
                    alt={cut.name}
                    className={`w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-[1500ms] ease-out ${cut.isAvailable === false ? 'grayscale brightness-75' : ''}`}
                />
                
                {/* Availability Badge - Hero Style Skew */}
                {cut.isAvailable === false && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-48 shadow-2xl">
                        <div className="bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.5em] px-4 py-3 text-center border-l-4 border-primary">
                            Out of Stock
                        </div>
                    </div>
                )}

                {/* Star of Freshness Badge */}
                {!cut.isAvailable === false && (
                    <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-[-10px] group-hover:translate-y-0">
                        <div className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white border border-white/20">
                            <Star size={12} fill="white" className="animate-pulse" />
                        </div>
                    </div>
                )}

                {/* Hover Add to Cart Button - Specialized Tech Style */}
                <AnimatePresence>
                    {isHovered && cut.isAvailable !== false && (
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 30 }}
                            onClick={handleAdd}
                            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 px-8 py-3 bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.4em] hover:bg-primary transition-all duration-300 shadow-xl"
                        >
                            <span className="flex items-center gap-3">
                                <Plus size={14} className="text-primary" />
                                Add To Selection
                            </span>
                        </motion.button>
                    )}
                </AnimatePresence>
                
                {/* Image Overlay Gradient */}
                <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-gray-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>

            {/* Product Metadata */}
            <div className="flex-grow flex flex-col items-center text-center px-4">
                <div className="text-gray-400 text-[8px] font-bold uppercase tracking-[0.6em] mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    Precision Grade
                </div>
                
                <h3 className="font-serif font-black text-gray-900 text-2xl group-hover:text-primary transition-colors duration-500 mb-2 tracking-tighter line-clamp-1">
                    {cut.name}
                </h3>
                
                <div className="h-[1px] w-8 bg-gray-100 group-hover:w-16 group-hover:bg-primary/20 transition-all duration-700 mb-4"></div>
                
                <div className="mt-auto pb-4">
                    <p className="text-gray-900 font-sans font-bold flex items-center justify-center gap-2">
                        <span className="text-primary tracking-tighter text-lg">₹{cut.pricePerKg}</span>
                        <span className="text-gray-300 text-[10px] font-medium uppercase tracking-widest">/ Per Kilogram</span>
                    </p>
                </div>
            </div>

            {/* Confirmation Alert - Minimal Tech Style */}
            <AnimatePresence>
                {showConfirm && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute inset-0 z-40 bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
                    >
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                            <ShoppingCart size={24} className="text-primary animate-bounce-slow" />
                        </div>
                        <h4 className="text-xl font-serif font-black mb-2 text-gray-900">Added to Selection</h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Master Inventory Updated</p>
                        <div className="mt-6 flex items-center gap-1">
                            <div className="h-1 w-8 bg-primary"></div>
                            <div className="h-1 w-1 bg-gray-100"></div>
                            <div className="h-1 w-1 bg-gray-100"></div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
