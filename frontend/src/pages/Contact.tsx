import { Phone, Mail, MapPin, Clock, MessageCircle, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';

export function Contact() {
    return (
        <div className="min-h-screen bg-[#fcfbfa] py-8 sm:py-16 pb-32">
            <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
                
                {/* Header */}
                <div className="mb-8 sm:mb-12 text-center max-w-xl mx-auto">
                    <span className="text-primary text-[10px] font-bold uppercase tracking-[0.3em] mb-2 block">
                        Get In Touch
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-serif font-black text-gray-900 tracking-tight mb-3">
                        Contact <span className="text-primary italic">Thahoor.</span>
                    </h1>
                    <p className="text-gray-500 text-xs sm:text-sm font-light leading-relaxed">
                        Visit our boutique butchery at Kayamkulam or get in touch for fresh home deliveries, party cuts, and custom slicing.
                    </p>
                </div>

                {/* Quick Mobile Action Bar */}
                <div className="grid grid-cols-2 gap-3 mb-8 sm:hidden">
                    <a
                        href="tel:8075575472"
                        className="p-3.5 bg-primary text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-xs shadow-md shadow-primary/20 active:scale-95"
                    >
                        <Phone size={16} />
                        <span>Call Store</span>
                    </a>
                    <a
                        href="https://wa.me/918075575472?text=Hello%20Thahoor%20Protein,%20I%20have%20an%20inquiry"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3.5 bg-emerald-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-xs shadow-md active:scale-95"
                    >
                        <MessageCircle size={16} />
                        <span>WhatsApp</span>
                    </a>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
                    {/* Contact Info Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between"
                    >
                        <div className="space-y-6">
                            <h2 className="text-xl sm:text-2xl font-serif font-black text-gray-900 mb-6 border-b border-gray-100 pb-4">
                                Store Information
                            </h2>

                            <div className="flex items-start gap-4">
                                <div className="bg-primary/10 p-3 rounded-2xl text-primary shrink-0">
                                    <Phone size={22} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-sm">Direct Phone</h3>
                                    <a href="tel:8075575472" className="text-primary font-bold text-base hover:underline block">
                                        8075575472
                                    </a>
                                    <a href="tel:04792446480" className="text-gray-500 text-xs hover:underline block">
                                        Landline: 0479 2446480
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600 shrink-0">
                                    <MessageCircle size={22} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-sm">WhatsApp Concierge</h3>
                                    <a 
                                        href="https://wa.me/918075575472?text=Hello%20Thahoor%20Protein"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-emerald-600 font-bold text-sm hover:underline block"
                                    >
                                        Chat with Butcher (8075575472)
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-primary/10 p-3 rounded-2xl text-primary shrink-0">
                                    <MapPin size={22} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-sm">Butchery Hub Location</h3>
                                    <p className="text-gray-600 text-xs leading-relaxed">
                                        5GF2+XXG, SH 6, Kayamkulam, Kerala 690502
                                    </p>
                                    <a 
                                        href="https://maps.google.com/maps?q=5GF2%2BXXG%2C%20SH%206%2C%20Kayamkulam%2C%20Kerala%20690502"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-primary text-xs font-bold mt-1 hover:underline"
                                    >
                                        <Navigation size={12} /> Open in Google Maps
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-primary/10 p-3 rounded-2xl text-primary shrink-0">
                                    <Clock size={22} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-sm">Business Hours</h3>
                                    <p className="text-gray-600 text-xs">Monday – Sunday: 7:00 AM – 9:00 PM</p>
                                    <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full mt-1">
                                        Open 7 Days a Week
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-primary/10 p-3 rounded-2xl text-primary shrink-0">
                                    <Mail size={22} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-sm">Email Support</h3>
                                    <a href="mailto:thahoorprotein@gmail.com" className="text-gray-600 text-xs hover:text-primary">
                                        thahoorprotein@gmail.com
                                    </a>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Google Map */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-3 rounded-3xl shadow-sm border border-gray-100 h-[360px] sm:h-[480px] overflow-hidden"
                    >
                        <iframe
                            src="https://maps.google.com/maps?q=5GF2%2BXXG%2C%20SH%206%2C%20Kayamkulam%2C%20Kerala%20690502&t=&z=15&ie=UTF8&iwloc=&output=embed"
                            width="100%"
                            height="100%"
                            style={{ border: 0, borderRadius: '1.25rem' }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Thahoor Protein Store Location"
                        ></iframe>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
