import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CategoriesSection } from '../components/home/CategoriesSection';

export function Home() {
    return (
        <div className="bg-white min-h-screen">

            {/* Hero Section */}
            <section className="relative h-[600px] bg-gradient-to-r from-orange-500 to-orange-400 overflow-hidden flex items-center">
                {/* Background Texture Overlay */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                <div className="container mx-auto px-4 z-10 grid grid-cols-1 md:grid-cols-2 items-center">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-white text-center md:text-left pt-12"
                    >
                        <h2 className="font-display text-2xl md:text-3xl font-medium mb-2 tracking-wide text-white/90">
                            ALWAYS
                        </h2>
                        <h1 className="font-display text-5xl md:text-7xl font-bold mb-4 drop-shadow-md">
                            FRESH MEAT
                        </h1>
                        <p className="font-display text-2xl md:text-3xl italic font-light mb-10 text-white/90">
                            Low Prices And Affordable
                        </p>

                        <Link
                            to="/shop"
                            className="inline-block bg-primary text-white border-b-4 border-red-900 font-bold px-10 py-4 rounded hover:bg-red-800 transition-transform active:translate-y-1 active:border-b-0"
                        >
                            SHOP ONLINE
                        </Link>
                    </motion.div>

                    {/* Right Image */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="relative flex justify-center"
                    >
                        <img
                            src="/assets/hero_meat_platter_2.jpg"
                            alt="Fresh Meat Platter"
                            className="w-full h-auto object-contain mix-blend-multiply"
                        />
                    </motion.div>
                </div>
            </section>

            {/* Categories Section */}
            <CategoriesSection />

        </div>
    );
}
