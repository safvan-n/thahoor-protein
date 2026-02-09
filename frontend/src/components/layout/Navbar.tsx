import { ShoppingCart, Phone, User } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { useUserStore } from '../../store/userStore';
import { AuthModal } from '../auth/AuthModal';

export function Navbar() {
    const cartItems = useCartStore((state) => state.items);
    const itemCount = cartItems.length;

    const { isAuthenticated } = useUserStore();
    const [showAuthModal, setShowAuthModal] = useState(false);

    return (
        <div className="flex flex-col w-full">
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
            {/* Top Black Bar */}
            <div className="bg-black text-white py-2 px-4 shadow-sm z-50">
                <div className="max-w-7xl mx-auto flex justify-between items-center text-xs md:text-sm font-medium">
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-2">
                            <Phone size={14} className="text-secondary" /> Call Us: 8075575472
                        </span>
                    </div>
                    <div className="flex items-center gap-6">
                        {isAuthenticated ? (
                            <Link to="/profile" className="flex items-center gap-2 hover:text-secondary transition-colors font-bold">
                                <User size={16} /> <span className="hidden sm:inline">Profile</span>
                            </Link>
                        ) : (
                            <>
                                <button onClick={() => setShowAuthModal(true)} className="hover:text-secondary transition-colors cursor-pointer">Sign Up</button>
                                <button onClick={() => setShowAuthModal(true)} className="hover:text-secondary transition-colors cursor-pointer">Login</button>
                            </>
                        )}
                        <Link to="/cart" className="flex items-center gap-2 hover:text-secondary transition-colors">
                            <motion.div
                                key={itemCount}
                                initial={{ scale: 1 }}
                                animate={{ scale: [1, 1.5, 1] }}
                                transition={{ duration: 0.3 }}
                            >
                                <ShoppingCart size={14} />
                            </motion.div>
                            Cart {itemCount > 0 && `(${itemCount})`}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Red Navigation Bar */}
            <nav className="bg-primary text-white shadow-md relative z-40">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo Area */}

                        <Link to="/" className="flex flex-col items-center justify-center p-1 rounded-b-full bg-white absolute top-0 h-32 w-32 shadow-lg border-4 border-secondary z-50 overflow-hidden group">
                            <img
                                src="/assets/logo_round.jpg"
                                alt="Thahoor Protein"
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                            />
                        </Link>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center justify-center w-full pl-32 space-x-8 lg:space-x-12">
                            {[
                                { name: 'HOME', path: '/' },
                                { name: 'SHOP ONLINE', path: '/shop' },
                                { name: 'HOW TO COOK IT', path: '/recipes' },
                                { name: 'ABOUT', path: '/about' },
                                { name: 'CONTACT', path: '/contact' },
                            ].map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className="text-xs lg:text-sm font-bold tracking-wider hover:text-secondary transition-colors"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        {/* Mobile Menu Icon placeholer */}
                        <div className="md:hidden ml-auto">
                            {/* Simple hamburger */}
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    );
}
