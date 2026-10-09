import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCategoryStore } from '../../store/categoryStore';
import { useEffect } from 'react';
import { Skeleton } from '../ui/Skeleton';

export function CategoriesSection() {
    const navigate = useNavigate();
    const categories = useCategoryStore(state => state.categories);
    const isLoading = useCategoryStore(state => state.isLoading);
    const fetchCategories = useCategoryStore(state => state.fetchCategories);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleCategoryClick = (categoryId: string) => {
        navigate(`/shop?category=${categoryId}`);
    };

    return (
        <section className="py-16 sm:py-24 md:py-32 relative overflow-hidden bg-[#fcfcfa] border-b">
            <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
                
                {/* Section Header */}
                <header className="mb-12 sm:mb-20 flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-12 border-b border-gray-200 pb-8 sm:pb-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="max-w-2xl"
                    >
                        <div className="text-primary text-[10px] sm:text-xs font-bold uppercase tracking-[0.4em] mb-3 flex items-center gap-3">
                            <span className="w-8 h-[2px] bg-primary"></span>
                            Selections
                        </div>
                        <h2 className="text-3xl sm:text-5xl md:text-7xl font-serif font-black text-gray-900 leading-tight tracking-tight">
                            Select Your <br className="hidden sm:inline" />
                            <span className="text-primary italic">Preferred Cut.</span>
                        </h2>
                    </motion.div>
                    
                    <motion.p 
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="text-gray-500 max-w-md font-light text-sm sm:text-lg leading-relaxed italic"
                    >
                        "Each category represents a pinnacle of culinary purity, precision graded at source for absolute excellence."
                    </motion.p>
                </header>

                {/* Alternating Layouts for Categories */}
                <div className="space-y-12 sm:space-y-20 md:space-y-28">
                    {isLoading ? (
                        [...Array(3)].map((_, i) => (
                            <div key={i} className={`flex flex-col lg:flex-row gap-8 lg:gap-16 items-center ${i % 2 === 0 ? '' : 'lg:flex-row-reverse'}`}>
                                <Skeleton className="flex-1 aspect-[16/10] w-full rounded-2xl" />
                                <div className="flex-1 max-w-xl space-y-4 sm:space-y-6 w-full">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-10 w-3/4" />
                                    <Skeleton className="h-16 w-full" />
                                    <Skeleton className="h-10 w-40" />
                                </div>
                            </div>
                        ))
                    ) : categories.map((category: any, index: number) => {
                        const isEven = index % 2 === 0;
                        return (
                            <motion.div
                                key={category.id}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                onClick={() => handleCategoryClick(category.id)}
                                className={`flex flex-col lg:flex-row gap-6 sm:gap-10 lg:gap-16 items-center cursor-pointer group bg-white lg:bg-transparent p-4 sm:p-6 lg:p-0 rounded-2xl border border-gray-100 lg:border-none shadow-sm lg:shadow-none hover:shadow-lg lg:hover:shadow-none transition-all ${
                                    isEven ? '' : 'lg:flex-row-reverse'
                                }`}
                            >
                                {/* Image Area */}
                                <div className="flex-1 relative w-full overflow-hidden rounded-2xl bg-gray-100 shadow-md group-hover:shadow-xl transition-all duration-500">
                                    <img
                                        src={category.image}
                                        alt={category.name}
                                        loading="lazy"
                                        className="w-full aspect-[16/10] sm:aspect-[16/9] object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                                    />
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300"></div>
                                    
                                    {/* Numbering Badge */}
                                    <span className="absolute bottom-3 right-4 text-3xl sm:text-5xl font-serif font-black text-white/40 pointer-events-none drop-shadow">
                                        0{index + 1}
                                    </span>
                                </div>

                                {/* Text Area */}
                                <div className="flex-1 max-w-xl w-full">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-primary text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.4em]">
                                            Authentic Cut
                                        </span>
                                        <div className="flex-1 h-[1px] bg-gray-200"></div>
                                    </div>
                                    
                                    <h3 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-black text-gray-900 group-hover:text-primary transition-colors duration-300 mb-3 sm:mb-4 tracking-tight">
                                        {category.name}
                                    </h3>
                                    
                                    <p className="text-gray-500 text-xs sm:text-base font-light mb-6 sm:mb-8 leading-relaxed border-l-2 border-primary/30 pl-4">
                                        {category.description || "The peak of protein purity, hand-selected by our master butchers for its nutritional profile and culinary excellence."}
                                    </p>
                                    
                                    <div className="inline-flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gray-900 text-white font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-primary transition-all duration-300 active:scale-95 shadow-md">
                                        <span>Explore Collection</span>
                                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                    
                                    {/* Stats Highlights */}
                                    <div className="mt-6 sm:mt-10 flex items-center gap-4 sm:gap-8 pt-4 border-t border-gray-100 text-gray-600">
                                        <div>
                                            <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-gray-400">Prep</p>
                                            <p className="text-xs sm:text-sm font-bold text-gray-800">Fresh Cleaned</p>
                                        </div>
                                        <div className="w-[1px] h-6 bg-gray-200"></div>
                                        <div>
                                            <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-gray-400">Certification</p>
                                            <p className="text-xs sm:text-sm font-bold text-gray-800">100% Halal</p>
                                        </div>
                                        <div className="w-[1px] h-6 bg-gray-200"></div>
                                        <div>
                                            <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-gray-400">Delivery</p>
                                            <p className="text-xs sm:text-sm font-bold text-emerald-600">Express 45m</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Bottom Trust Badge */}
                <div className="mt-16 sm:mt-24 pt-12 border-t border-gray-200 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-3">
                        <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                        Certified Master Butchery
                    </div>
                    <h4 className="text-xl sm:text-2xl font-serif font-black text-gray-900 tracking-tight">Kayamkulam Daily Fresh Meat Hub</h4>
                    <p className="text-gray-400 text-xs mt-1">Direct inquiries & bulk orders: 8075575472</p>
                </div>
            </div>
        </section>
    );
}
