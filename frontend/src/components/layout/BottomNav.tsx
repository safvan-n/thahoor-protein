import { Home, UtensilsCrossed, ShoppingCart, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { motion } from 'framer-motion';

export function BottomNav() {
    const location = useLocation();
    const cartItems = useCartStore((state) => state.items);
    const itemCount = cartItems.length;

    const isActive = (path: string) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    const navItems = [
        { path: '/', label: 'Home', icon: Home },
        { path: '/shop', label: 'Cuts', icon: UtensilsCrossed },
        { path: '/cart', label: 'Cart', icon: ShoppingCart, badge: itemCount },
        { path: '/profile', label: 'Account', icon: User },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe">
            <nav className="flex items-center justify-around h-16 px-2">
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    const Icon = item.icon;

                    return (
                        <Link 
                            key={item.path} 
                            to={item.path} 
                            className="relative flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-transform active:scale-90"
                        >
                            <div className="relative">
                                <div 
                                    className={`w-10 h-7 flex items-center justify-center rounded-full transition-all duration-300 ${
                                        active 
                                            ? 'bg-primary text-white shadow-md shadow-primary/25' 
                                            : 'text-gray-500 hover:text-gray-900'
                                    }`}
                                >
                                    <Icon size={18} strokeWidth={active ? 2.4 : 1.8} />
                                </div>

                                {item.badge && item.badge > 0 ? (
                                    <motion.span 
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm"
                                    >
                                        {item.badge}
                                    </motion.span>
                                ) : null}
                            </div>

                            <span 
                                className={`text-[10px] font-bold tracking-tight transition-colors mt-0.5 ${
                                    active ? 'text-primary font-black' : 'text-gray-400'
                                }`}
                            >
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
