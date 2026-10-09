import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CategoriesSection } from '../components/home/CategoriesSection';
import { CutCard } from '../components/product/CutCard';
import { ShieldCheck, ArrowRight, Truck, Award, Clock, MessageCircle, Phone, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCategoryStore } from '../store/categoryStore';
import { useProductStore } from '../store/productStore';

export function Home() {
    const [activeHeroSlide, setActiveHeroSlide] = useState(0);

    const categories = useCategoryStore((state) => state.categories);
    const fetchCategories = useCategoryStore((state) => state.fetchCategories);

    const products = useProductStore((state) => state.products);
    const fetchProducts = useProductStore((state) => state.fetchProducts);

    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, [fetchCategories, fetchProducts]);

    const slides = [
        {
            title: "Premium Cuts.",
            subtitle: "Artisan Quality",
            description: "Direct from the farm to your doorstep in Kayamkulam. Experience 100% Halal, hormone-free freshness.",
            image: "/assets/hero_meat_platter_2.jpg",
            tag: "Heritage Selection"
        },
        {
            title: "Ethical Sourcing.",
            subtitle: "Pure & Cleaned",
            description: "No compromises. Vacuum-chilled daily cuts prepared with traditional precision for your family.",
            image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&q=80&w=2000",
            tag: "Farm to Door"
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveHeroSlide(prev => (prev + 1) % slides.length);
        }, 8000);
        return () => clearInterval(interval);
    }, [slides.length]);

    // Top 4 featured cuts for Home page preview
    const featuredCuts = products.slice(0, 4);

    return (
        <div className="bg-white min-h-screen selection:bg-primary/20 selection:text-primary overflow-x-hidden">

            {/* Premium Hero Section */}
            <section className="relative min-h-[75vh] sm:min-h-[85vh] md:h-[90vh] flex items-center bg-[#111114] overflow-hidden pt-12 sm:pt-16 md:pt-0">
                
                {/* Background Carousel */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeHeroSlide}
                        initial={{ opacity: 0, scale: 1.08 }}
                        animate={{ opacity: 0.55, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="absolute inset-0 z-0 bg-cover bg-center brightness-90"
                        style={{ backgroundImage: `url(${slides[activeHeroSlide].image})` }}
                    />
                </AnimatePresence>

                {/* Gradients */}
                <div className="absolute inset-0 z-1 bg-gradient-to-t md:bg-gradient-to-r from-black/90 via-black/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 h-32 z-1 bg-gradient-to-t from-[#111114] to-transparent"></div>

                <div className="container mx-auto px-4 sm:px-6 relative z-10 py-12">
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, y: 25 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7 }}
                        >
                            <span className="inline-flex items-center gap-2 py-1.5 px-3.5 bg-primary text-white text-[10px] font-bold uppercase tracking-[0.3em] rounded-full mb-4 sm:mb-6 shadow-md">
                                <Sparkles size={11} /> {slides[activeHeroSlide].tag}
                            </span>
                            
                            <h2 className="text-secondary text-sm sm:text-xl font-serif italic mb-2">
                                {slides[activeHeroSlide].subtitle}
                            </h2>
                            
                            <h1 className="text-3xl sm:text-6xl md:text-8xl font-serif font-black text-white leading-tight tracking-tight mb-4 sm:mb-6">
                                {slides[activeHeroSlide].title}
                            </h1>
                            
                            <p className="text-sm sm:text-lg text-gray-300 font-light mb-8 max-w-lg leading-relaxed border-l-2 border-primary/40 pl-4 sm:pl-6">
                                {slides[activeHeroSlide].description}
                            </p>

                            {/* Action Buttons for Mobile & Desktop */}
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
                                <Link
                                    to="/shop"
                                    className="px-6 sm:px-8 py-3.5 sm:py-4 bg-primary hover:bg-primary-dark text-white font-bold uppercase tracking-wider text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/30 transition-all active:scale-95"
                                >
                                    <span>Browse Fresh Cuts</span>
                                    <ArrowRight size={16} />
                                </Link>
                                
                                <a
                                    href="https://wa.me/918075575472?text=Hello%20Thahoor%20Protein,%20I%20would%20like%20to%20order"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-6 sm:px-8 py-3.5 sm:py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-wider text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
                                >
                                    <MessageCircle size={16} />
                                    <span>WhatsApp Order</span>
                                </a>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Progress Indicators */}
                <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4">
                    {slides.map((_, i) => (
                        <button 
                            key={i} 
                            onClick={() => setActiveHeroSlide(i)}
                            aria-label={`Slide ${i + 1}`}
                            className="p-1 group"
                        >
                            <span className={`block h-1.5 rounded-full transition-all duration-500 ${
                                activeHeroSlide === i ? 'w-10 bg-primary' : 'w-3 bg-white/30 group-hover:bg-white/60'
                            }`}></span>
                        </button>
                    ))}
                </div>
            </section>

            {/* Mobile Quick-Swipe Categories Bar */}
            {categories.length > 0 && (
                <div className="bg-[#121214] text-white py-3 border-y border-white/10 sticky top-[57px] sm:top-[68px] z-30 shadow-md">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 shrink-0 mr-1 hidden sm:inline">
                                Quick Jump:
                            </span>
                            <Link
                                to="/shop"
                                className="px-3.5 py-1.5 bg-primary/20 hover:bg-primary border border-primary/30 text-white text-xs font-bold rounded-full whitespace-nowrap transition-colors shrink-0"
                            >
                                All Cuts
                            </Link>
                            {categories.map((cat) => (
                                <Link
                                    key={cat.id}
                                    to={`/shop?category=${cat.id}`}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/40 text-gray-200 text-xs font-medium rounded-full whitespace-nowrap transition-colors shrink-0"
                                >
                                    {cat.image && (
                                        <img src={cat.image} alt={cat.name} className="w-4 h-4 rounded-full object-cover" />
                                    )}
                                    <span>{cat.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Quality Standard Badges */}
            <section className="bg-white border-b border-gray-100 py-6 sm:py-8">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                        {[
                            { icon: Truck, title: "45-Min Express Delivery", desc: "Across Kayamkulam" },
                            { icon: ShieldCheck, title: "100% Halal & Clean", desc: "Hormone & chemical free" },
                            { icon: Award, title: "Artisan Grade Cuts", desc: "Precision butchery" },
                            { icon: Clock, title: "Daily Morning Cuts", desc: "Always fresh, never stale" }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/80 border border-gray-100">
                                <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                                    <item.icon size={18} />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">{item.title}</h4>
                                    <p className="text-[10px] text-gray-500 truncate">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Fresh Cuts Section (Instant 1-Tap Ordering) */}
            {featuredCuts.length > 0 && (
                <section className="py-12 sm:py-16 bg-[#fbfbfa] border-b border-gray-100">
                    <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
                        <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
                            <div>
                                <div className="flex items-center gap-2 text-primary text-[10px] font-bold uppercase tracking-widest mb-1">
                                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                                    Fresh Today
                                </div>
                                <h2 className="text-2xl sm:text-4xl font-serif font-black text-gray-900 tracking-tight">
                                    Most Popular Cuts
                                </h2>
                            </div>
                            <Link 
                                to="/shop" 
                                className="text-xs font-bold text-primary hover:text-primary-dark flex items-center gap-1 uppercase tracking-wider shrink-0"
                            >
                                <span>See All</span>
                                <ArrowRight size={14} />
                            </Link>
                        </div>

                        {/* 2-col on mobile, 4-col on desktop */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                            {featuredCuts.map((cut) => (
                                <CutCard key={cut.id} cut={cut} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Categories Showcase */}
            <CategoriesSection />

            {/* Quick Contact & WhatsApp Order Banner */}
            <section className="py-12 sm:py-16 bg-gradient-to-br from-primary-900 via-primary to-primary-800 text-white relative overflow-hidden">
                <div className="container mx-auto px-4 sm:px-6 max-w-4xl text-center relative z-10">
                    <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
                        Instant Delivery Available
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-serif font-black mb-3 tracking-tight">
                        Need Custom Cuts or Bulk Orders?
                    </h2>
                    <p className="text-sm sm:text-base text-white/90 mb-8 max-w-lg mx-auto font-light leading-relaxed">
                        Call directly or chat with our master butchers for customized thicknesses, curry cuts, or party orders.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <a 
                            href="tel:8075575472"
                            className="w-full sm:w-auto px-6 py-3.5 bg-white text-gray-900 hover:bg-gray-100 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
                        >
                            <Phone size={16} className="text-primary" />
                            Call: 8075575472
                        </a>
                        <a 
                            href="https://wa.me/918075575472?text=Hello%20Thahoor%20Protein,%20I%20have%20a%20query%20regarding%20meat%20orders"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
                        >
                            <MessageCircle size={16} />
                            WhatsApp Us
                        </a>
                    </div>
                </div>
            </section>

        </div>
    );
}
