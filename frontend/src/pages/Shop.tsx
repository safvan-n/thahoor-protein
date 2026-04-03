import { useSearchParams } from 'react-router-dom';
import { useProductStore } from '../store/productStore';
import { useCategoryStore } from '../store/categoryStore';
import { CutCard } from '../components/product/CutCard';
import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUserStore } from '../store/userStore';
import { AuthModal } from '../components/auth/AuthModal';

export function Shop() {
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedCatId = searchParams.get('category');

    // ✅ Get products + fetch function
    const products = useProductStore((state) => state.products);
    const fetchProducts = useProductStore((state) => state.fetchProducts);

    // ✅ Get categories + fetch function
    const categories = useCategoryStore((state) => state.categories);
    const fetchCategories = useCategoryStore((state) => state.fetchCategories);

    // ✅ IMPORTANT: Fetch data when page loads
    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [fetchProducts, fetchCategories]);

    // ✅ Filtering logic
    const filteredCuts = useMemo(() => {
        if (!selectedCatId) return products;

        // Ensure string comparison
        return products.filter(
            (c) => String(c.categoryId) === String(selectedCatId)
        );
    }, [selectedCatId, products]);

    const { isAuthenticated } = useUserStore();
    const [showAuthModal, setShowAuthModal] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            const timer = setTimeout(() => setShowAuthModal(true), 1000);
            return () => clearTimeout(timer);
        }
    }, [isAuthenticated]);

    return (
        <div className="container mx-auto px-4 py-8">
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
            />

            {/* Header */}
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-bold mb-4 tracking-tight">
                    Our Premium Cuts
                </h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Browse our selection of antibiotic-free, farm-fresh meats.
                    Hand-picked and cut to perfection by our expert butchers.
                </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex justify-center mb-12">
                <div className="flex gap-2 p-1 bg-muted/50 rounded-full border border-border overflow-x-auto max-w-full">
                    <button
                        onClick={() =>
                            setSearchParams({})
                        }
                        className={`px-6 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all duration-300 ${
                            !selectedCatId
                                ? 'bg-white text-primary shadow-md'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        All
                    </button>
                    {categories.map((cat: any) => (
                        <button
                            key={cat.id}
                            onClick={() =>
                                setSearchParams({ category: cat.id })
                            }
                            className={`px-6 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all duration-300 ${
                                selectedCatId === cat.id
                                    ? 'bg-white text-primary shadow-md'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Product Grid */}
            {filteredCuts.length === 0 ? (
                <div className="text-center py-32 bg-muted/20 rounded-3xl border border-dashed">
                    <p className="text-muted-foreground text-lg">
                        No items found in this category.
                    </p>
                </div>
            ) : (
                <motion.div
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                >
                    {filteredCuts.map((cut) => (
                        <CutCard key={cut.id} cut={cut} />
                    ))}
                </motion.div>
            )}
        </div>
    );
}