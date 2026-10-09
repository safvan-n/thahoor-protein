import { type ReactNode } from 'react';
import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';
import { FloatingCartBanner } from './FloatingCartBanner';
import { MapPin, Mail, Phone, ChevronRight, ArrowRight, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LayoutProps {
    children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
    return (
        <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-primary selection:text-white">
            <Navbar />
            <main className="flex-grow pt-0 pb-20 md:pb-0">
                {children}
            </main>
            
            {/* Floating Quick Cart Bar on Mobile */}
            <FloatingCartBanner />
            
            {/* Mobile Bottom Dock */}
            <BottomNav />
            
            {/* Premium Butchery Footer */}
            <footer className="relative bg-[#111114] text-white pt-16 md:pt-28 pb-24 md:pb-16 overflow-hidden border-t border-white/5">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 md:gap-16 lg:gap-20 mb-16">
                        
                        {/* Brand Column */}
                        <div className="lg:col-span-5">
                            <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
                                <div className="w-14 h-14 bg-white p-0.5 flex items-center justify-center overflow-hidden shadow-xl rounded-full border-2 border-primary group-hover:scale-105 transition-transform duration-300">
                                    <img 
                                        src="/assets/logo_round.jpg" 
                                        alt="Thahoor Protein Official Logo" 
                                        className="w-full h-full object-cover scale-[1.25]" 
                                    />
                                </div>
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-serif font-black text-white tracking-tight leading-none">
                                        THAHOOR<span className="text-primary italic">.</span>
                                    </h2>
                                    <span className="text-secondary text-[9px] font-bold uppercase tracking-[0.25em]">
                                        Artisan Butchery & Farm Cuts
                                    </span>
                                </div>
                            </Link>
                            <p className="text-gray-400 text-sm md:text-base font-light leading-relaxed mb-6 max-w-md">
                                Fresh, pasture-raised, 100% hormone-free meat. Graded at source and delivered with precision cold-chain logistics.
                            </p>
                            <div className="flex items-center gap-3">
                                <a 
                                    href="https://wa.me/918075575472" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    aria-label="WhatsApp" 
                                    className="p-3 bg-white/5 rounded-xl border border-white/10 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all"
                                >
                                    <MessageCircle size={18} />
                                </a>
                                <a 
                                    href="tel:8075575472" 
                                    aria-label="Phone"
                                    className="p-3 bg-white/5 rounded-xl border border-white/10 text-primary hover:bg-primary hover:text-white transition-all"
                                >
                                    <Phone size={18} />
                                </a>
                                <a 
                                    href="mailto:thahoorprotein@gmail.com" 
                                    aria-label="Email"
                                    className="p-3 bg-white/5 rounded-xl border border-white/10 text-primary hover:bg-primary hover:text-white transition-all"
                                >
                                    <Mail size={18} />
                                </a>
                            </div>
                        </div>

                        {/* Quick Links Column */}
                        <div className="lg:col-span-3">
                            <h4 className="text-primary text-[11px] font-bold uppercase tracking-[0.3em] mb-6">Explore</h4>
                            <ul className="space-y-3.5 text-xs font-bold uppercase tracking-wider">
                                {[
                                    { name: 'Fresh Cuts Collection', path: '/shop' },
                                    { name: 'Chef Recipes & Tips', path: '/recipes' },
                                    { name: 'Store & Contact', path: '/contact' },
                                    { name: 'Member Profile', path: '/profile' }
                                ].map((item) => (
                                    <li key={item.name}>
                                        <Link to={item.path} className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                                            <ArrowRight size={12} className="text-primary opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Location Column */}
                        <div className="lg:col-span-4">
                            <h4 className="text-primary text-[11px] font-bold uppercase tracking-[0.3em] mb-6">Kayamkulam Station Hub</h4>
                            <div className="p-6 border border-white/10 bg-white/5 backdrop-blur-sm rounded-2xl relative group">
                                <div className="flex items-start gap-3.5 mb-5">
                                    <MapPin size={22} className="text-primary shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-white text-base font-bold mb-1">Thahoor Protein Hub</p>
                                        <p className="text-gray-400 text-xs leading-relaxed">
                                            5GF2+XXG, SH 6, Kayamkulam, Kerala 690502<br />
                                            Daily: 7:00 AM – 9:00 PM
                                        </p>
                                    </div>
                                </div>
                                <a 
                                    href="https://www.google.com/maps/search/?api=1&query=5GF2%2BXXG%2C%20SH%206%2C%20Kayamkulam%2C%20Kerala%20690502"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 w-full py-3 bg-primary hover:bg-primary-dark text-white text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-md"
                                >
                                    Open Google Maps <ChevronRight size={14} />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Footer Bottom Bar */}
                    <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                            © {new Date().getFullYear()} Thahoor Protein • Pure Halal Farm Cuts
                        </p>
                        <div className="flex items-center gap-6 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                            <Link to="/contact" className="hover:text-primary transition-colors">Support</Link>
                            <Link to="/shop" className="hover:text-primary transition-colors">Catalog</Link>
                            <a href="tel:8075575472" className="hover:text-primary transition-colors">8075575472</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
