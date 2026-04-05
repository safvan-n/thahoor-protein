import { Home, ShoppingBag, ShoppingCart, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';

export function BottomNav() {
    const location = useLocation();
    const cartItems = useCartStore((state) => state.items);
    const itemCount = cartItems.length;

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/90 backdrop-blur-xl border-t border-gray-100 pb-safe">
            <div className="flex items-center justify-around h-20 px-4">
                <Link to="/" className="flex flex-col items-center gap-1 group">
                    <div className={`p-2 rounded-2xl transition-all duration-300 ${isActive('/') ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' : 'text-gray-400'}`}>
                        <Home size={20} />
                    </div>
                </Link>

                <Link to="/shop" className="flex flex-col items-center gap-1 group">
                    <div className={`p-2 rounded-2xl transition-all duration-300 ${isActive('/shop') ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' : 'text-gray-400'}`}>
                        <ShoppingBag size={20} />
                    </div>
                </Link>

                <Link to="/cart" className="relative flex flex-col items-center gap-1 group">
                    <div className={`p-2 rounded-2xl transition-all duration-300 ${isActive('/cart') ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' : 'text-gray-400'}`}>
                        <ShoppingCart size={20} />
                    </div>
                    {itemCount > 0 && (
                        <span className="absolute top-1 right-1 h-5 w-5 bg-stone-900 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm scale-110">
                            {itemCount}
                        </span>
                    )}
                </Link>

                <Link to="/profile" className="flex flex-col items-center gap-1 group">
                    <div className={`p-2 rounded-2xl transition-all duration-300 ${isActive('/profile') ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' : 'text-gray-400'}`}>
                        <User size={20} />
                    </div>
                </Link>
            </div>
        </div>
    );
}
