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
        <section className="py-32 relative overflow-hidden bg-[#fcfcfa] border-b">
            
            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                
                {/* Section Header - Clean & Professional */}
                <header className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-12 border-b border-gray-200 pb-12">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="max-w-2xl"
                    >
                        <div className="text-primary text-xs font-bold uppercase tracking-[0.4em] mb-4 flex items-center gap-4">
                            <span className="w-12 h-[2px] bg-primary"></span>
                            Selections
                        </div>
                        <h2 className="text-4xl md:text-8xl font-serif font-black text-gray-900 leading-none tracking-tighter">
                            Select Your <br />
                            <span className="text-primary italic">Preferred Cut.</span>
                        </h2>
                    </motion.div>
                    
                    <motion.p 
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="text-gray-500 max-w-sm font-light text-xl leading-relaxed italic"
                    >
                        "Each category represents a pinnacle of culinary purity, precision graded at source for absolute excellence."
                    </motion.p>
                </header>

                {/* Alternating Large Layouts for Categories */}
                <div className="space-y-32">
                    {isLoading ? (
                        [...Array(3)].map((_, i) => (
                            <div key={i} className={`flex flex-col lg:flex-row gap-16 lg:gap-24 items-center ${i % 2 === 0 ? '' : 'lg:flex-row-reverse'}`}>
                                <Skeleton className="flex-1 aspect-[16/10] w-full" />
                                <div className="flex-1 max-w-xl space-y-8">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-16 w-full" />
                                    <Skeleton className="h-24 w-full" />
                                    <Skeleton className="h-12 w-48" />
                                </div>
                            </div>
                        ))
                    ) : categories.map((category: any, index: number) => {
                        const isEven = index % 2 === 0;
                        return (
                            <motion.div
                                key={category.id}
                                initial={{ opacity: 0, y: 100 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                onClick={() => handleCategoryClick(category.id)}
                                className={`flex flex-col lg:flex-row gap-16 lg:gap-24 items-center cursor-pointer group ${isEven ? '' : 'lg:flex-row-reverse'}`}
                            >
                                {/* Image Area - Large & Enticing */}
                                <div className="flex-1 relative w-full overflow-hidden shadow-3xl bg-gray-100 group-hover:shadow-[0_40px_80px_rgba(0,0,0,0.15)] transition-all duration-700">
                                    <img
                                        src={category.image}
                                        alt={category.name}
                                        className="w-full aspect-[16/10] object-cover grayscale-[10%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-in-out"
                                    />
                                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500"></div>
                                    
                                    {/* Numbering Background */}
                                    <span className="absolute -bottom-8 -right-8 text-[15rem] leading-none font-serif font-black opacity-5 text-gray-900 pointer-events-none group-hover:opacity-10 transition-opacity duration-700">
                                        0{index + 1}
                                    </span>
                                </div>

                                {/* Text Area - Elegant & High End */}
                                <div className="flex-1 max-w-xl">
                                    <div className="flex items-center gap-4 mb-4">
                                        <span className="text-primary text-[10px] font-bold uppercase tracking-[0.5em]">Authentic Selection</span>
                                        <div className="flex-1 h-[1px] bg-gray-200"></div>
                                    </div>
                                    
                                    <h3 className="text-4xl md:text-6xl font-serif font-black text-gray-900 group-hover:text-primary transition-colors duration-500 mb-8 tracking-tighter">
                                        {category.name}
                                    </h3>
                                    
                                    <p className="text-gray-500 text-lg md:text-xl font-light mb-12 leading-relaxed border-l-2 border-gray-200 pl-8 group-hover:border-primary transition-all duration-500">
                                        {category.description || "The peak of protein purity, hand-selected by our master butchers for its nutritional profile and culinary excellence."}
                                    </p>
                                    
                                    <div className="group/btn inline-flex items-center gap-6 px-10 py-5 bg-gray-900 text-white font-bold uppercase tracking-widest text-xs hover:bg-primary transition-all duration-300 active:scale-95 shadow-xl">
                                        Explore This Cut
                                        <ArrowRight size={16} className="group-hover/btn:translate-x-2 transition-transform duration-300" />
                                    </div>
                                    
                                    {/* Subcategories or Stats Placeholder */}
                                    <div className="mt-16 flex items-center gap-8 opacity-40 group-hover:opacity-100 transition-opacity duration-700">
                                        <div className="text-center">
                                            <p className="text-[10px] font-bold uppercase tracking-widest mb-1">Cold Prep</p>
                                            <p className="text-lg font-serif">Vacuum Seal</p>
                                        </div>
                                        <div className="w-[1px] h-8 bg-gray-200"></div>
                                        <div className="text-center">
                                            <p className="text-[10px] font-bold uppercase tracking-widest mb-1">Grade</p>
                                            <p className="text-lg font-serif">A+ Certified</p>
                                        </div>
                                        <div className="w-[1px] h-8 bg-gray-200"></div>
                                        <div className="text-center">
                                            <p className="text-[10px] font-bold uppercase tracking-widest mb-1">Origin</p>
                                            <p className="text-lg font-serif">Local Farm</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Bottom Craftsmanship Badge */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="mt-48 py-24 border-t border-gray-200 text-center"
                >
                    <div className="inline-block p-4 border border-gray-100 rounded-full mb-12">
                        <div className="w-24 h-24 rounded-full border-4 border-double border-primary flex items-center justify-center animate-spin-slow">
                            <span className="text-primary font-bold uppercase tracking-widest text-[8px]">THAH</span>
                        </div>
                    </div>
                    <h4 className="text-4xl font-serif font-black text-gray-900 mb-6 tracking-tighter">Certified Master Butchery</h4>
                    <p className="text-gray-400 text-sm font-bold uppercase tracking-[0.4em]">Establishment No. 8075575472</p>
                </motion.div>
            </div>
        </section>
    );
}
