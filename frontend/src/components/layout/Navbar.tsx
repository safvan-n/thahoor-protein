import { ShoppingCart, Phone, User, Search, Menu, X, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { useUserStore } from '../../store/userStore';
import { AuthModal } from '../auth/AuthModal';

export function Navbar() {
    const location = useLocation();
    const cartItems = useCartStore((state) => state.items);
    const itemCount = cartItems.length;
    const { isAuthenticated } = useUserStore();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 30);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Active link helper
    const isActive = (path: string) => location.pathname === path;

    return (
        <>
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
            
            {/* Top Bar - Contact & Support (Reduced) */}
            <div className={`hidden md:block bg-gray-900 text-white transition-transform duration-500 overflow-hidden ${
                isScrolled ? '-translate-y-full h-0' : 'translate-y-0 h-8'
            }`}>
                <div className="container mx-auto px-6 h-full flex items-center justify-between">
                    <div className="flex items-center gap-8 text-[9px] font-bold uppercase tracking-[0.3em] opacity-60">
                        <span className="flex items-center gap-2"><Phone size={10} fill="white" className="text-primary" /> 8075575472</span>
                        <span className="flex items-center gap-2"><ArrowRight size={10} className="text-secondary" /> Farm to Door</span>
                    </div>
                    <div className="flex items-center gap-6 text-[9px] font-bold uppercase tracking-[0.3em] opacity-60">
                        <Link to="/contact" className="hover:text-primary transition-colors">Support</Link>
                        <Link to="/about" className="hover:text-primary transition-colors">Heritage</Link>
                    </div>
                </div>
            </div>

            <header 
                className={`sticky top-0 left-0 right-0 z-[100] transition-all duration-500 ${
                    isScrolled ? 'bg-white shadow-xl py-1' : 'bg-white/95 backdrop-blur-md py-2'
                } border-b border-gray-100`}
            >
                <div className="container mx-auto px-6">
                    <nav className="flex items-center justify-between">
                        
                        {/* Official Circular Branding Logo - Responsive Size */}
                        <Link to="/" className="relative flex items-center justify-center -mt-4 sm:-mt-6 mr-4 sm:mr-6 group shrink-0">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white p-1 shadow-2xl border-[3px] border-primary overflow-hidden transition-all duration-700 group-hover:scale-105 group-hover:rotate-6">
                                <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                                    <img 
                                        src="/assets/logo_round.jpg" 
                                        alt="Thahoor Protein Official Logo" 
                                        className="w-full h-full object-contain scale-[1.3] group-hover:scale-[1.4] transition-transform duration-700 brightness-105"
                                    />
                                </div>
                            </div>
                        </Link>

                        {/* Desktop Menu - High Contrast & Clean */}
                        <div className="hidden md:flex items-center gap-4 lg:gap-8 ml-auto px-12">
                            {[
                                { name: 'Home', path: '/' },
                                { name: 'Collections', path: '/shop' },
                                { name: 'Our Secrets', path: '/recipes' },
                                { name: 'Contact', path: '/contact' },
                            ].map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`relative px-4 py-2 text-[11px] font-black uppercase tracking-[0.4em] transition-all duration-300 ${
                                        isActive(link.path) 
                                        ? 'text-primary' 
                                        : 'text-gray-900 hover:text-primary'
                                    } group`}
                                >
                                    {link.name}
                                    <span className={`absolute bottom-0 left-0 h-[2px] bg-primary transition-all duration-500 ${isActive(link.path) ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                                </Link>
                            ))}
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-6 border-l border-gray-100 pl-8">
                            {/* Search */}
                            <button className="hidden lg:block text-gray-400 hover:text-primary transition-colors">
                                <Search size={18} />
                            </button>

                            {/* User Profile */}
                            {isAuthenticated ? (
                                <Link to="/profile" className="text-gray-400 hover:text-primary transition-all active:scale-95">
                                    <User size={18} />
                                </Link>
                            ) : (
                                <button 
                                    onClick={() => setShowAuthModal(true)}
                                    className="hidden sm:block text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-primary transition-colors"
                                >
                                    Member Login
                                </button>
                            )}

                            {/* Shopping Cart - High Impact (Resized) */}
                            <Link 
                                to="/cart" 
                                className="relative flex items-center gap-3 py-2 px-4 bg-gray-900 text-white font-black uppercase tracking-widest text-[9px] hover:bg-primary transition-all duration-500 active:scale-95 group shadow-lg"
                            >
                                <ShoppingCart size={14} className="group-hover:-rotate-12 transition-transform" />
                                <span className="hidden lg:inline">The Cart</span>
                                {itemCount > 0 && (
                                    <motion.span 
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="h-4 w-4 bg-white text-black flex items-center justify-center rounded-full text-[7px] border-[1.5px] border-primary -ml-1"
                                    >
                                        {itemCount}
                                    </motion.span>
                                )}
                            </Link>

                            {/* Mobile Menu Icon */}
                            <button 
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden text-gray-900 hover:text-primary transition-colors"
                            >
                                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                            </button>
                        </div>
                    </nav>
                </div>

                {/* Mobile Menu Overlay - Premium Style */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: '100%' }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: '100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-0 top-[60px] sm:top-[80px] z-[100] md:hidden bg-white px-8 py-16 flex flex-col gap-10"
                        >
                            {[
                                { name: 'Heritage Selection', path: '/' },
                                { name: 'Shop The Cuts', path: '/shop' },
                                { name: 'Master Recipes', path: '/recipes' },
                                { name: 'Concierge Contact', path: '/contact' },
                                { name: 'Member Profile', path: '/profile' },
                            ].map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-4xl font-serif font-black text-gray-900 hover:text-primary transition-colors text-right"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="mt-auto pt-12 border-t border-gray-100 text-center">
                                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400 mb-4">Official Logistics</p>
                                <p className="text-2xl font-serif text-gray-900">8075575472</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>
        </>
    );
}
