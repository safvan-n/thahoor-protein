import { useSearchParams } from 'react-router-dom';
import { useProductStore } from '../store/productStore';
import { useCategoryStore } from '../store/categoryStore';
import { CutCard } from '../components/product/CutCard';
import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '../store/userStore';
import { AuthModal } from '../components/auth/AuthModal';
import { Skeleton } from '../components/ui/Skeleton';
import { Filter, Grid3X3, Star } from 'lucide-react';

export function Shop() {
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedCatId = searchParams.get('category');

    // ✅ Get products + fetch function
    const products = useProductStore((state) => state.products);
    const isLoading = useProductStore((state) => state.isLoading);
    const fetchProducts = useProductStore((state) => state.fetchProducts);

    // ✅ Get categories + fetch function
    const categories = useCategoryStore((state) => state.categories);
    const fetchCategories = useCategoryStore((state) => state.fetchCategories);

    // ✅ Fetch data when page loads
    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [fetchProducts, fetchCategories]);

    // ✅ Filtering logic
    const filteredCuts = useMemo(() => {
        if (!selectedCatId) return products;
        return products.filter((c) => String(c.categoryId) === String(selectedCatId));
    }, [selectedCatId, products]);

    const { isAuthenticated } = useUserStore();
    const [showAuthModal, setShowAuthModal] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            const timer = setTimeout(() => setShowAuthModal(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [isAuthenticated]);

    // Find active category name
    const activeCategoryName = selectedCatId 
        ? categories.find(c => String(c.id) === String(selectedCatId))?.name 
        : 'All Collections';

    return (
        <div className="min-h-screen bg-[#fcfcfa] pb-32">
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

            {/* Premium Page Header */}
            <header className="relative pt-40 pb-20 overflow-hidden bg-white border-b border-gray-100">
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                
                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="text-primary text-[10px] font-bold uppercase tracking-[0.6em] mb-4 flex items-center gap-4">
                                <span className="w-12 h-[2px] bg-primary"></span>
                                Established Quality
                            </div>
                            <h1 className="text-3xl md:text-8xl font-serif font-black text-gray-900 tracking-tighter leading-none mb-6">
                                The Master <br />
                                <span className="text-primary italic">Selection.</span>
                            </h1>
                            <p className="text-lg md:text-xl font-light max-w-xl leading-relaxed italic border-l-2 border-primary/20 pl-8">
                                "Hand-selected by our heritage butchers, each cut represents the absolute peak of protein purity and technical excellence."
                            </p>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="hidden lg:block p-8 border border-gray-100 shadow-2xl bg-white relative group"
                        >
                            <div className="absolute top-0 right-0 w-12 h-12 bg-primary flex items-center justify-center text-white -rotate-6 translate-x-4 -translate-y-4 shadow-lg group-hover:rotate-0 transition-transform">
                                <Star fill="white" size={20} />
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-1">Curation Grade</p>
                                    <p className="text-2xl font-serif font-black text-gray-900">Premium A+</p>
                                </div>
                                <div className="h-12 w-[1px] bg-gray-100"></div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-1">Origin Protocol</p>
                                    <p className="text-2xl font-serif font-black text-gray-900">Verified</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </header>

            {/* Filter Navigation Bar */}
            <div className="sticky top-[100px] z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100 py-4 shadow-sm">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        {/* Category Links */}
                        <div className="flex items-center gap-1 overflow-x-auto pb-2 md:pb-0 max-w-full no-scrollbar">
                            <button
                                onClick={() => setSearchParams({})}
                                className={`px-6 py-2 text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-300 rounded-none border-b-2 whitespace-nowrap ${
                                    !selectedCatId
                                        ? 'text-primary border-primary bg-primary/5'
                                        : 'text-gray-400 border-transparent hover:text-gray-900 hover:border-gray-200'
                                }`}
                            >
                                All Collections
                            </button>
                            {categories.map((cat: any) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSearchParams({ category: cat.id })}
                                    className={`px-6 py-2 text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-300 rounded-none border-b-2 whitespace-nowrap ${
                                        selectedCatId === cat.id
                                            ? 'text-primary border-primary bg-primary/5'
                                            : 'text-gray-400 border-transparent hover:text-gray-900 hover:border-gray-200'
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>

                        {/* Layout Controls - Visual Only for now */}
                        <div className="hidden md:flex items-center gap-4 border-l border-gray-100 pl-6">
                            <div className="flex items-center gap-2 text-gray-400">
                                <Filter size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Filter: High to Low</span>
                            </div>
                            <div className="flex items-center gap-2 text-primary">
                                <Grid3X3 size={18} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Product Section */}
            <div className="container mx-auto px-6 py-16 max-w-7xl">
                
                {/* Active Category Display */}
                <div className="mb-12 flex items-center justify-between">
                    <h2 className="text-2xl font-serif font-black text-gray-900 tracking-tight">
                        {activeCategoryName} <span className="text-gray-300 ml-4 text-sm font-sans font-medium tracking-widest">/ {filteredCuts.length} Items</span>
                    </h2>
                    <div className="h-[1px] flex-1 bg-gray-100 mx-10 hidden md:block"></div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">
                        Precision Graded Selection
                    </div>
                </div>

                {/* Product Grid */}
                <AnimatePresence mode="popLayout">
                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="flex flex-col gap-6">
                                    <Skeleton className="aspect-[4/5] rounded-none w-full" />
                                    <div className="flex flex-col items-center gap-2">
                                        <Skeleton className="h-2 w-16" />
                                        <Skeleton className="h-6 w-32" />
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredCuts.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center py-40 bg-white border border-gray-100 shadow-xl"
                        >
                            <span className="text-primary text-xs font-bold uppercase tracking-[0.5em] mb-4 block">Selection Gap</span>
                            <p className="text-gray-400 text-xl font-serif italic">
                                We are currently selecting the next batch of premium cuts for this collection.
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            layout
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12"
                        >
                            {filteredCuts.map((cut, index) => (
                                <motion.div
                                    key={cut.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.05 }}
                                >
                                    <CutCard cut={cut} />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            {/* Bottom Curation Note */}
            <div className="container mx-auto px-6 mt-32 text-center max-w-3xl">
                <div className="w-16 h-16 rounded-full border border-primary/20 flex items-center justify-center mx-auto mb-10">
                    <div className="w-2 h-2 rounded-full bg-primary animate-ping"></div>
                </div>
                <h3 className="text-3xl font-serif font-black text-gray-900 mb-6 tracking-tighter">Your Health, Our Protocol.</h3>
                <p className="text-gray-500 font-light leading-relaxed mb-12">
                    Every item in our collection undergoes a rigorous multi-stage molecular check to ensure no hormones, no antibiotics, and constant cold-chain integrity. 
                </p>
                <div className="inline-flex items-center gap-6 py-4 px-8 bg-gray-900 text-white text-[10px] font-bold uppercase tracking-[0.4em] shadow-2xl">
                    Full Tracking Verification
                </div>
            </div>

        </div>
    );
}