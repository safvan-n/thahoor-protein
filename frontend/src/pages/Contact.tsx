import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export function Contact() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mb-12 text-center">
                <h1 className="text-4xl font-bold mb-4 tracking-tight">Contact Us</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    We'd love to hear from you. Visit our store or get in touch with us for orders and queries.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Contact Info */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                >
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-primary/10 p-3 rounded-full text-primary">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800">Phone</h3>
                                    <p className="text-gray-600">8075575472</p>
                                    <p className="text-gray-600">04792446480</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-primary/10 p-3 rounded-full text-primary">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800">Email</h3>
                                    <p className="text-gray-600">support@thahoor.com</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-primary/10 p-3 rounded-full text-primary">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800">Location</h3>
                                    <p className="text-gray-600">5GF2+XXG, SH 6</p>
                                    <p className="text-gray-600">Kayamkulam, Kerala 690502</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-primary/10 p-3 rounded-full text-primary">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800">Business Hours</h3>
                                    <p className="text-gray-600">Monday - Sunday</p>
                                    <p className="text-gray-600">7:00 AM - 9:00 PM</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Map */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 h-[500px]"
                >
                    <iframe
                        src="https://maps.google.com/maps?q=5GF2%2BXXG%2C%20SH%206%2C%20Kayamkulam%2C%20Kerala%20690502&t=&z=15&ie=UTF8&iwloc=&output=embed"
                        width="100%"
                        height="100%"
                        style={{ border: 0, borderRadius: '1rem' }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                </motion.div>
            </div>
        </div>
    );
}
