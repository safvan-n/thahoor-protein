import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../../data/mockData';

export function CategoriesSection() {
    const navigate = useNavigate();

    const handleCategoryClick = (categoryId: string) => {
        navigate(`/shop?category=${categoryId}`);
    };

    return (
        <section className="py-20 bg-gradient-to-br from-orange-500 via-red-600 to-red-900 relative overflow-hidden">
            {/* Background Animation Elements */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <motion.div
                    animate={{
                        y: [-20, 20, -20],
                        opacity: [0.1, 0.3, 0.1],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-20 right-[-100px] w-[500px] h-[500px] bg-white rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{
                        x: [-30, 30, -30],
                        opacity: [0.1, 0.2, 0.1],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                    className="absolute top-[40%] left-[-100px] w-[400px] h-[400px] bg-yellow-300 rounded-full blur-[80px]"
                />
                <motion.div
                    animate={{
                        y: [30, -30, 30],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                    }}
                    className="absolute bottom-0 right-[20%] w-[600px] h-[600px] bg-orange-300 rounded-full blur-[120px]"
                />
            </div>

            <div className="container mx-auto px-4 max-w-7xl relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="font-display text-5xl font-bold text-white mb-4 tracking-tight drop-shadow-sm">Our Collections</h2>
                    <div className="h-1.5 w-24 bg-white/80 mx-auto rounded-full"></div>
                    <p className="mt-4 text-white/90 font-medium tracking-wide uppercase text-sm">Premium quality for every meal</p>
                </motion.div>

                <div className="space-y-8 lg:space-y-12">
                    {CATEGORIES.map((category, index) => {
                        const isEven = index % 2 === 0;

                        return (
                            <motion.div
                                key={category.id}
                                initial={{ opacity: 0, y: 100 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.7, ease: "easeOut" }}
                                onClick={() => handleCategoryClick(category.id)}
                                className="group relative overflow-hidden rounded-3xl shadow-2xl bg-white/95 backdrop-blur-sm border border-white/20 hover:shadow-3xl transition-all duration-500 cursor-pointer"
                            >
                                <div className={`flex flex-col md:flex-row h-full md:h-[400px] ${isEven ? '' : 'md:flex-row-reverse'}`}>
                                    {/* Image Section */}
                                    <div className="relative w-full md:w-3/5 h-[300px] md:h-full overflow-hidden">
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10"></div>
                                        <img
                                            src={category.image}
                                            alt={category.name}
                                            className="w-full h-full object-cover transform scale-100 group-hover:scale-110 transition-transform duration-700 ease-in-out"
                                        />
                                    </div>

                                    {/* Content Section */}
                                    <div className="w-full md:w-2/5 p-8 md:p-12 flex flex-col justify-center relative bg-white z-20">
                                        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-primary/50 to-transparent"></div>

                                        <h3 className="font-display text-4xl font-bold text-gray-900 mb-4 group-hover:text-primary transition-colors">
                                            {category.name}
                                        </h3>

                                        {category.description && (
                                            <p className="text-gray-500 text-lg mb-8 font-light italic leading-relaxed">
                                                "{category.description}"
                                            </p>
                                        )}

                                        <div className="flex items-center gap-2 text-primary font-bold tracking-widest uppercase text-sm group-hover:gap-4 transition-all duration-300">
                                            Start Shopping
                                            <span className="bg-primary text-white rounded-full p-1 group-hover:bg-red-800 transition-colors">
                                                <ChevronRight size={16} />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
