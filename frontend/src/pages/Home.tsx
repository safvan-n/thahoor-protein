import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CategoriesSection } from '../components/home/CategoriesSection';
import { ShieldCheck, ArrowRight, Truck, Star, Award, Clock } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

export function Home() {
    const targetRef = useRef(null);

    const [activeHeroSlide, setActiveHeroSlide] = useState(0);
    const slides = [
        {
            title: "Premium Cuts.",
            subtitle: "Artisan Quality",
            description: "Direct from the farm to your doorstep. Experience the pinnacle of butchery craftsmanship with Thahoor Protein.",
            image: "/assets/hero_meat_platter_2.jpg",
            tag: "Heritage Selection"
        },
        {
            title: "Ethical Sourcing.",
            subtitle: "Hormone Free",
            description: "We don't believe in shortcuts. Only 100% natural, pasture-raised protein for your family's health.",
            image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&q=80&w=2000",
            tag: "Nature First"
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveHeroSlide(prev => (prev + 1) % slides.length);
        }, 8000);
        return () => clearInterval(interval);
    }, [slides.length]);

    return (
        <div className="bg-white min-h-screen selection:bg-primary/20 selection:text-primary overflow-x-hidden">

            {/* Premium Hero Section */}
            <section ref={targetRef} className="relative h-[95vh] flex items-center bg-[#111111] overflow-hidden">
                
                {/* Background Image Carousel with Parallax */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeHeroSlide}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 0.6, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="absolute inset-0 z-0 bg-cover bg-center grayscale-[20%] brightness-75"
                        style={{ backgroundImage: `url(${slides[activeHeroSlide].image})` }}
                    />
                </AnimatePresence>

                {/* Subtle Overlay Gradients */}
                <div className="absolute inset-0 z-1 bg-gradient-to-r from-black via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 h-32 z-1 bg-gradient-to-t from-black to-transparent"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-3xl">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <span className="inline-block py-2 px-4 bg-primary text-white text-[10px] font-bold uppercase tracking-[0.4em] mb-8">
                                {slides[activeHeroSlide].tag}
                            </span>
                            <h2 className="text-white text-xl md:text-4xl font-serif text-luxury mb-4 opacity-80">
                                {slides[activeHeroSlide].subtitle}
                            </h2>
                            <h1 className="text-5xl md:text-9xl font-serif font-black text-white leading-none mb-8 tracking-tighter">
                                {slides[activeHeroSlide].title}
                            </h1>
                            <p className="text-lg md:text-2xl text-gray-300 font-light mb-12 max-w-lg leading-relaxed border-l-2 border-primary/40 pl-8">
                                {slides[activeHeroSlide].description}
                            </p>

                            <div className="flex flex-wrap gap-6 items-center">
                                <Link
                                    to="/shop"
                                    className="group relative px-12 py-5 bg-primary text-white font-bold uppercase tracking-widest overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] active:scale-95"
                                >
                                    <span className="relative z-10 flex items-center gap-3">
                                        Shop The Collection <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform duration-300" />
                                    </span>
                                </Link>
                                
                                <Link
                                    to="/recipes"
                                    className="px-10 py-5 bg-white/5 border border-white/20 text-white font-bold uppercase tracking-widest backdrop-blur-md hover:bg-white/10 transition-all active:scale-95 flex items-center gap-2"
                                >
                                    How To Cook It
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Progress Indicators */}
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 flex items-center gap-8">
                    {slides.map((_, i) => (
                        <button 
                            key={i} 
                            onClick={() => setActiveHeroSlide(i)}
                            className="group flex flex-col items-center gap-2"
                        >
                            <span className={`h-[2px] transition-all duration-700 ${activeHeroSlide === i ? 'w-16 bg-primary' : 'w-8 bg-white/20 group-hover:bg-white/50'}`}></span>
                            <span className={`text-[10px] uppercase font-bold tracking-widest ${activeHeroSlide === i ? 'text-primary' : 'text-white/40'}`}>0{i + 1}</span>
                        </button>
                    ))}
                </div>
            </section>

            {/* Quality Standard Bar */}
            <section className="bg-white border-b relative z-10">
                <div className="container mx-auto px-6 py-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { icon: Truck, text: "Ultra-Fast 45min Delivery" },
                            { icon: ShieldCheck, text: "100% Hormone Free" },
                            { icon: Award, text: "Premium Certified Quality" },
                            { icon: Clock, text: "Always Fresh Selection" }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-4 group justify-center md:justify-start">
                                <div className="p-3 rounded-full bg-gray-50 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                                    <item.icon size={20} />
                                </div>
                                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-600 line-clamp-1">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories Section with Improved Layout */}
            <div className="bg-[#fcfcfa]">
                <CategoriesSection />
            </div>

            {/* Testimonials / Social Proof */}
            <section className="py-32 bg-[#111111] relative overflow-hidden">
                {/* Visual Texture Background */}
                <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <span className="text-primary text-xs font-bold uppercase tracking-[0.4em] mb-8 block">Member Loyalty</span>
                    <h2 className="text-4xl md:text-6xl font-serif font-black text-white mb-20 tracking-tight">What Our Connoisseurs Say</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
                        {[
                            { name: "Johnathan Miller", text: "The Wagyu cuts are unlike anything I've found locally. The delivery is surgical—on time and chilled perfectly.", role: "Executive Chef" },
                            { name: "Sofia Rodriguez", text: "Finally, a service that prioritizes ethical sourcing as much as I do. The chicken is incredibly fresh.", role: "Palaeo Enthusiast" },
                            { name: "Michael Cheng", text: "The packaging is next-level. I've never had better ribs delivered to my house. Absolute perfection.", role: "BBQ Pitmaster" }
                        ].map((t, i) => (
                            <motion.div 
                                key={i}
                                whileHover={{ y: -10 }}
                                className="bg-white/5 backdrop-blur-sm p-12 border border-white/10 relative"
                            >
                                <div className="flex gap-1 justify-center mb-8">
                                    {[1, 2, 3, 4, 5].map(n => <Star key={n} size={14} className="text-primary fill-primary" />)}
                                </div>
                                <p className="text-gray-300 text-lg italic font-light mb-10 leading-relaxed">"{t.text}"</p>
                                <p className="text-white font-bold uppercase tracking-[0.2em] text-xs">{t.name}</p>
                                <p className="text-primary/60 text-[10px] uppercase font-bold tracking-widest mt-2">{t.role}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Premium CTA / Membership */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <div className="relative rounded-none p-12 md:p-24 overflow-hidden bg-primary text-white text-center shadow-3xl">
                        <div className="absolute top-0 right-0 w-1/3 h-full bg-black/10 blur-[100px] skew-x-12 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-1/3 h-full bg-white/5 blur-[100px] -skew-x-12 -translate-x-1/2"></div>
                        
                        <div className="relative z-10 max-w-3xl mx-auto">
                            <h2 className="text-4xl md:text-6xl font-serif font-black mb-8 leading-tight">Join The Butchery Circle.</h2>
                            <p className="text-white/80 text-xl font-light mb-12 max-w-lg mx-auto">
                                Subscribe for early access to limited-edition seasonal cuts, master butchery recipes, and concierge logistics.
                            </p>
                            
                            <form className="flex flex-col sm:flex-row gap-0 max-w-xl mx-auto border-4 border-white">
                                <input 
                                    type="email" 
                                    placeholder="Enter your email for the concierge" 
                                    className="flex-1 bg-transparent px-8 py-5 text-white placeholder:text-white/60 focus:outline-none focus:bg-white/10 transition-all font-bold uppercase tracking-widest text-xs"
                                />
                                <button className="px-10 py-5 bg-white text-primary font-black uppercase tracking-widest text-xs hover:bg-gray-100 transition-all active:scale-95">
                                    Subscribe Now
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}
