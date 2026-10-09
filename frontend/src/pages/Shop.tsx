import { useSearchParams } from 'react-router-dom';
import { useProductStore } from '../store/productStore';
import { useCategoryStore } from '../store/categoryStore';
import { CutCard } from '../components/product/CutCard';
import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '../components/ui/Skeleton';
import { Search, Sparkles, SlidersHorizontal, X } from 'lucide-react';

export function Shop() {
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedCatId = searchParams.get('category');

    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'featured' | 'low-high' | 'high-low'>('featured');

    // Get products & categories
    const products = useProductStore((state) => state.products);
    const isLoading = useProductStore((state) => state.isLoading);
    const fetchProducts = useProductStore((state) => state.fetchProducts);

    const categories = useCategoryStore((state) => state.categories);
    const fetchCategories = useCategoryStore((state) => state.fetchCategories);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [fetchProducts, fetchCategories]);

    // Filtering & Sorting logic
    const filteredCuts = useMemo(() => {
        let list = [...products];

        // Filter by category
        if (selectedCatId) {
            list = list.filter((c) => String(c.categoryId) === String(selectedCatId));
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(c => 
                c.name.toLowerCase().includes(q) || 
                (c.description && c.description.toLowerCase().includes(q))
            );
        }

        // Sort
        if (sortBy === 'low-high') {
            list.sort((a, b) => a.pricePerKg - b.pricePerKg);
        } else if (sortBy === 'high-low') {
            list.sort((a, b) => b.pricePerKg - a.pricePerKg);
        }

        return list;
    }, [selectedCatId, products, searchQuery, sortBy]);

    // Active category title
    const activeCategoryName = selectedCatId 
        ? categories.find(c => String(c.id) === String(selectedCatId))?.name 
        : 'All Collections';

    return (
        <div className="min-h-screen bg-[#fcfbfa] pb-32">

            {/* Page Header */}
            <header className="relative pt-12 sm:pt-20 md:pt-24 pb-8 sm:pb-12 bg-white border-b border-gray-100">
                <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
                    <div className="max-w-2xl">
                        <div className="text-primary text-[10px] font-bold uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                            <Sparkles size={12} />
                            <span>Farm-To-Door Quality</span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-black text-gray-900 tracking-tight leading-none mb-3">
                            Fresh Butchery <span className="text-primary italic">Cuts.</span>
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 font-light max-w-xl leading-relaxed">
                            Hand-selected Halal poultry, mutton, and artisan cuts. Vacuum-chilled for pure taste and peak nutrition.
                        </p>
                    </div>

                    {/* Search and Sort Toolbar */}
                    <div className="mt-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                        {/* Search Bar */}
                        <div className="relative flex-1 max-w-md">
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search chicken, mutton, boneless..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-9 py-2.5 bg-gray-50 hover:bg-gray-100/80 focus:bg-white rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-primary transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {/* Sort Dropdown */}
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                            <SlidersHorizontal size={14} className="text-gray-400" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Sort:</span>
                            <select
                                value={sortBy}
                                onChange={(e: any) => setSortBy(e.target.value)}
                                className="bg-gray-50 border border-gray-200 text-gray-800 text-xs font-bold rounded-lg px-2.5 py-2 focus:outline-none focus:border-primary"
                            >
                                <option value="featured">Featured</option>
                                <option value="low-high">Price: Low to High</option>
                                <option value="high-low">Price: High to Low</option>
                            </select>
                        </div>
                    </div>
                </div>
            </header>

            {/* Category Filter Chips Bar (Sticky on Mobile & Desktop) */}
            <div className="sticky top-[57px] sm:top-[68px] z-30 bg-white/95 backdrop-blur-xl border-b border-gray-200 py-2.5 shadow-sm">
                <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                        <button
                            onClick={() => setSearchParams({})}
                            className={`px-4 py-2 text-xs font-bold rounded-full whitespace-nowrap transition-all shadow-sm ${
                                !selectedCatId
                                    ? 'bg-primary text-white shadow-primary/25'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            All Collections ({products.length})
                        </button>
                        {categories.map((cat: any) => {
                            const count = products.filter(p => String(p.categoryId) === String(cat.id)).length;
                            const isSelected = selectedCatId === cat.id;

                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setSearchParams({ category: cat.id })}
                                    className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-full whitespace-nowrap transition-all shadow-sm ${
                                        isSelected
                                            ? 'bg-primary text-white shadow-primary/25'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {cat.image && (
                                        <img src={cat.image} alt={cat.name} className="w-4 h-4 rounded-full object-cover" />
                                    )}
                                    <span>{cat.name}</span>
                                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Main Product Grid */}
            <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 max-w-7xl">
                
                {/* Status Line */}
                <div className="mb-4 sm:mb-6 flex items-center justify-between">
                    <h2 className="text-base sm:text-xl font-serif font-black text-gray-900 tracking-tight">
                        {activeCategoryName} 
                        <span className="text-gray-400 ml-2 text-xs font-sans font-normal">
                            ({filteredCuts.length} {filteredCuts.length === 1 ? 'cut' : 'cuts'})
                        </span>
                    </h2>
                    {searchQuery && (
                        <span className="text-xs text-primary font-medium">
                            Filtering by "{searchQuery}"
                        </span>
                    )}
                </div>

                {/* Grid */}
                <AnimatePresence mode="popLayout">
                    {isLoading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="flex flex-col gap-3 p-3 bg-white rounded-2xl border border-gray-100">
                                    <Skeleton className="aspect-square rounded-xl w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                    <Skeleton className="h-8 w-full rounded-xl" />
                                </div>
                            ))}
                        </div>
                    ) : filteredCuts.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
                        >
                            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                                🥩
                            </div>
                            <h3 className="text-lg font-serif font-black text-gray-900 mb-1">No Cuts Found</h3>
                            <p className="text-gray-400 text-xs max-w-md mx-auto mb-6">
                                We couldn't find any cuts matching your filter. Try clearing your search or selecting another category.
                            </p>
                            <button
                                onClick={() => { setSearchQuery(''); setSearchParams({}); }}
                                className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-md uppercase tracking-wider"
                            >
                                Reset Filters
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            layout
                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6"
                        >
                            {filteredCuts.map((cut, index) => (
                                <motion.div
                                    key={cut.id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.4) }}
                                >
                                    <CutCard cut={cut} />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

        </div>
    );
}