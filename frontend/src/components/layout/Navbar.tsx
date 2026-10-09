import { ShoppingCart, Phone, User, Search, Menu, X, ArrowRight, MessageCircle, MapPin } from 'lucide-react';
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
    const { isAuthenticated, user } = useUserStore();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu upon navigation
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    // Active link helper
    const isActive = (path: string) => location.pathname === path;

    return (
        <>
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
            
            {/* Top Bar - Contact & Support (Desktop Only) */}
            <div className={`hidden md:block bg-[#121214] text-white transition-all duration-500 overflow-hidden ${
                isScrolled ? '-translate-y-full h-0' : 'translate-y-0 h-9'
            } border-b border-white/5`}>
                <div className="container mx-auto px-6 h-full flex items-center justify-between">
                    <div className="flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.25em] text-gray-300">
                        <a href="tel:8075575472" className="flex items-center gap-2 hover:text-white transition-colors">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <Phone size={11} className="text-primary" /> 
                            <span>8075575472</span>
                        </a>
                        <span className="flex items-center gap-2 text-gray-400">
                            <MapPin size={11} className="text-secondary" /> Kayamkulam Hub
                        </span>
                        <span className="text-emerald-400 font-semibold">● Fresh Halal Farm Cuts</span>
                    </div>
                    <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400">
                        <a 
                            href="https://wa.me/918075575472?text=Hello%20Thahoor%20Protein,%20I%20would%20like%20to%20order" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                            <MessageCircle size={12} /> WhatsApp Order
                        </a>
                        <Link to="/contact" className="hover:text-white transition-colors">Store Locator</Link>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <header 
                className={`sticky top-0 left-0 right-0 z-[100] transition-all duration-300 ${
                    isScrolled 
                        ? 'bg-white/95 backdrop-blur-md shadow-md py-2 border-b border-gray-100' 
                        : 'bg-white/95 backdrop-blur-md py-2.5 sm:py-3 border-b border-gray-100'
                }`}
            >
                <div className="container mx-auto px-4 sm:px-6">
                    <nav className="flex items-center justify-between gap-2">
                        
                        {/* Brand Logo & Wordmark */}
                        <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
                            <div className="relative w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white p-0.5 shadow-md border-2 border-primary overflow-hidden transition-transform duration-500 group-hover:scale-105">
                                <img 
                                    src="/assets/logo_round.jpg" 
                                    alt="Thahoor Protein Official Logo" 
                                    className="w-full h-full object-cover scale-[1.25] group-hover:scale-[1.3] transition-transform duration-500"
                                />
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                    <span className="font-serif font-black text-xl sm:text-2xl text-gray-900 tracking-tight leading-none">
                                        THAHOOR
                                    </span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
                                </div>
                                <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.28em] text-secondary leading-tight mt-0.5">
                                    PROTEIN
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center gap-6 lg:gap-8 ml-auto px-8">
                            {[
                                { name: 'Home', path: '/' },
                                { name: 'Fresh Cuts', path: '/shop' },
                                { name: 'Master Recipes', path: '/recipes' },
                                { name: 'Store & Contact', path: '/contact' },
                            ].map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`relative py-2 text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-300 ${
                                        isActive(link.path) 
                                        ? 'text-primary' 
                                        : 'text-gray-700 hover:text-primary'
                                    } group`}
                                >
                                    {link.name}
                                    <span className={`absolute bottom-0 left-0 h-[2px] bg-primary transition-all duration-300 ${
                                        isActive(link.path) ? 'w-full' : 'w-0 group-hover:w-full'
                                    }`}></span>
                                </Link>
                            ))}
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-2 sm:gap-4 md:border-l md:border-gray-100 md:pl-6">
                            
                            {/* Quick Call Button (Mobile & Desktop) */}
                            <a 
                                href="tel:8075575472" 
                                aria-label="Call Store"
                                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-white flex items-center justify-center transition-all duration-300 active:scale-95"
                            >
                                <Phone size={16} />
                            </a>

                            {/* Search (Desktop) */}
                            <Link 
                                to="/shop" 
                                className="hidden lg:flex w-9 h-9 rounded-full hover:bg-gray-100 text-gray-500 hover:text-primary items-center justify-center transition-colors"
                            >
                                <Search size={18} />
                            </Link>

                            {/* User Profile (Desktop) */}
                            {isAuthenticated ? (
                                <Link 
                                    to="/profile" 
                                    className="hidden sm:flex items-center gap-2 text-gray-700 hover:text-primary text-[10px] font-bold uppercase tracking-wider transition-colors px-2 py-1"
                                >
                                    <User size={18} />
                                    <span className="hidden xl:inline max-w-[90px] truncate">{user?.name?.split(' ')[0] || 'Account'}</span>
                                </Link>
                            ) : (
                                <button 
                                    onClick={() => setShowAuthModal(true)}
                                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-[10px] font-bold uppercase tracking-wider text-gray-700 hover:border-primary hover:text-primary transition-all"
                                >
                                    <User size={13} />
                                    <span>Login</span>
                                </button>
                            )}

                            {/* Shopping Cart Button */}
                            <Link 
                                to="/cart" 
                                className="relative flex items-center gap-2 py-2 px-3 sm:px-4 bg-gray-900 hover:bg-primary text-white rounded-full font-bold text-xs transition-all duration-300 active:scale-95 shadow-sm group"
                            >
                                <ShoppingCart size={15} className="group-hover:-rotate-6 transition-transform" />
                                <span className="hidden sm:inline text-[10px] uppercase tracking-wider">Cart</span>
                                {itemCount > 0 && (
                                    <motion.span 
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="h-5 w-5 bg-primary text-white flex items-center justify-center rounded-full text-[10px] font-black shadow-sm group-hover:bg-white group-hover:text-primary transition-colors"
                                    >
                                        {itemCount}
                                    </motion.span>
                                )}
                            </Link>

                            {/* Mobile Menu Hamburger */}
                            <button 
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                aria-label="Toggle Menu"
                                className="md:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-900 transition-colors"
                            >
                                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </nav>
                </div>

                {/* Mobile Menu Slide-Over Drawer */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="fixed inset-0 top-[60px] bg-black/60 backdrop-blur-sm z-[90] md:hidden"
                            />

                            {/* Drawer Content */}
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="fixed inset-x-0 top-[60px] z-[95] md:hidden bg-white border-b border-gray-200 shadow-2xl px-6 py-6 max-h-[calc(100vh-60px)] overflow-y-auto"
                            >
                                {/* Quick User Greeting / Login */}
                                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 mb-6 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                                            <User size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-900">
                                                {isAuthenticated ? `Welcome, ${user?.name || 'Customer'}` : 'Guest Shopper'}
                                            </p>
                                            <p className="text-[10px] text-gray-500">
                                                {isAuthenticated ? user?.email : 'Login to view orders & tracking'}
                                            </p>
                                        </div>
                                    </div>
                                    {isAuthenticated ? (
                                        <Link 
                                            to="/profile" 
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="text-[10px] font-bold uppercase tracking-wider text-primary hover:underline"
                                        >
                                            View
                                        </Link>
                                    ) : (
                                        <button 
                                            onClick={() => { setIsMobileMenuOpen(false); setShowAuthModal(true); }}
                                            className="px-3 py-1.5 bg-primary text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm"
                                        >
                                            Login
                                        </button>
                                    )}
                                </div>

                                {/* Navigation Links */}
                                <div className="space-y-2 mb-6">
                                    {[
                                        { name: 'Home', path: '/', desc: 'Fresh cuts & specials' },
                                        { name: 'Fresh Cuts Store', path: '/shop', desc: 'Browse full butchery selection' },
                                        { name: 'Master Recipes', path: '/recipes', desc: 'Butcher-approved preparations' },
                                        { name: 'Store & Location', path: '/contact', desc: 'Kayamkulam Station, Kerala' },
                                        { name: 'Order History', path: '/profile', desc: 'Live tracking & past receipts' },
                                    ].map((link) => (
                                        <Link
                                            key={link.name}
                                            to={link.path}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`flex items-center justify-between p-3.5 rounded-xl transition-all ${
                                                isActive(link.path) 
                                                    ? 'bg-primary text-white font-bold' 
                                                    : 'hover:bg-gray-50 text-gray-900'
                                            }`}
                                        >
                                            <div>
                                                <div className="text-base font-bold">{link.name}</div>
                                                <div className={`text-xs ${isActive(link.path) ? 'text-white/80' : 'text-gray-400'}`}>
                                                    {link.desc}
                                                </div>
                                            </div>
                                            <ArrowRight size={16} className={isActive(link.path) ? 'text-white' : 'text-gray-400'} />
                                        </Link>
                                    ))}
                                </div>

                                {/* Direct Contact & Fast Ordering */}
                                <div className="pt-4 border-t border-gray-100 space-y-3">
                                    <a 
                                        href="https://wa.me/918075575472?text=Hello%20Thahoor%20Protein,%20I%20would%20like%20to%20place%20an%20order" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-md transition-colors"
                                    >
                                        <MessageCircle size={18} />
                                        Order via WhatsApp
                                    </a>
                                    <a 
                                        href="tel:8075575472" 
                                        className="w-full py-3.5 bg-gray-900 hover:bg-black text-white font-bold rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-md transition-colors"
                                    >
                                        <Phone size={18} />
                                        Call Butcher: 8075575472
                                    </a>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </header>
        </>
    );
}
