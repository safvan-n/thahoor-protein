import { type ReactNode } from 'react';
import { Navbar } from './Navbar';
import { MapPin, Mail, Phone, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LayoutProps {
    children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
    return (
        <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-primary selection:text-white">
            <Navbar />
            <main className="flex-grow pt-0">
                {children}
            </main>
            
            {/* Premium Heritage Footer */}
            <footer className="relative bg-gray-900 pt-32 pb-16 overflow-hidden">
                {/* Heritage Pattern Overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                
                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 mb-24">
                        
                        {/* Official Circular Branding Logo - Footer */}
                        <div className="lg:col-span-5">
                            <Link to="/" className="inline-flex flex-col items-start gap-1 mb-8 group">
                                <div className="w-20 h-20 bg-white p-1.5 flex items-center justify-center overflow-hidden shadow-2xl mb-6 group-hover:scale-105 transition-transform duration-500 rounded-full border-2 border-primary">
                                    <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                                        <img src="/assets/logo_round.jpg" alt="Thahoor Protein Official Logo" className="w-full h-full object-contain scale-[1.3]" />
                                    </div>
                                </div>
                                <h2 className="text-4xl font-serif font-black text-white tracking-tighter leading-none">
                                    THAHOOR<span className="text-primary italic">.</span>
                                </h2>
                                <span className="text-white/20 text-[8px] font-bold uppercase tracking-[0.3em] mt-1 ml-1">The Original Boutique Butchery</span>
                            </Link>
                            <p className="text-gray-400 text-lg font-light leading-relaxed mb-10 max-w-md">
                                "Our commitment is simple: providing the peak of protein purity through traditional mastery and modern logistics."
                            </p>
                            <div className="flex items-center gap-4">
                                <a href="mailto:thahoorprotein@gmail.com" className="p-4 bg-white/5 rounded-none border border-white/10 text-primary hover:bg-primary hover:text-white transition-all">
                                    <Mail size={18} />
                                </a>
                                <a href="tel:8075575472" className="p-4 bg-white/5 rounded-none border border-white/10 text-primary hover:bg-primary hover:text-white transition-all">
                                    <Phone size={18} />
                                </a>
                            </div>
                        </div>

                        {/* Navigation Links Column */}
                        <div className="lg:col-span-3">
                            <h4 className="text-primary text-[10px] font-bold uppercase tracking-[0.4em] mb-12">The Archive</h4>
                            <ul className="space-y-5">
                                {['Heritage Selections', 'Our Prime Shop', 'Master Recipes', 'Privacy Protocol', 'Liaison'].map((item) => (
                                    <li key={item}>
                                        <a href="#" className="group flex items-center gap-3 text-gray-400 hover:text-white transition-all text-xs font-bold uppercase tracking-widest">
                                            <ArrowRight size={12} className="text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                            {item}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Location / Hub Column */}
                        <div className="lg:col-span-4">
                            <h4 className="text-primary text-[10px] font-bold uppercase tracking-[0.4em] mb-12">Global Hub</h4>
                            <div className="p-8 border border-white/10 bg-white/5 backdrop-blur-sm relative group overflow-hidden">
                                {/* Corner Accents */}
                                <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-primary/30 group-hover:border-primary transition-colors"></div>
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-primary/30 group-hover:border-primary transition-colors"></div>
                                
                                <div className="flex items-start gap-4 mb-8">
                                    <MapPin size={24} className="text-primary shrink-0 mt-1" />
                                    <div>
                                        <p className="text-white text-lg font-serif mb-2">Kayamkulam Station</p>
                                        <p className="text-gray-500 text-sm leading-relaxed font-light">
                                            5GF2+XXG, SH 6,<br />
                                            Kayamkulam, Kerala 690502
                                        </p>
                                    </div>
                                </div>
                                <a 
                                    href="https://www.google.com/maps/search/?api=1&query=5GF2%2BXXG%2C%20SH%206%2C%20Kayamkulam%2C%20Kerala%20690502"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-3 w-full py-4 bg-white text-gray-900 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all shadow-xl"
                                >
                                    Launch Navigator <ChevronRight size={14} />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Utility Bar */}
                    <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
                            <p className="text-gray-600 text-[9px] font-bold uppercase tracking-[0.3em]">
                                © {new Date().getFullYear()} Thahoor Protein
                            </p>
                            <span className="hidden md:block text-white/5">|</span>
                            <p className="text-gray-600 text-[9px] font-bold uppercase tracking-[0.3em]">
                                Precision Graded & Certified
                            </p>
                        </div>
                        <div className="flex items-center gap-8 text-[9px] text-gray-600 font-bold uppercase tracking-[0.3em]">
                            <a href="#" className="hover:text-primary transition-colors">Sustainability Protocol</a>
                            <a href="#" className="hover:text-primary transition-colors">Ethics Standard</a>
                            <a href="#" className="hover:text-primary transition-colors">Quality Control</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
