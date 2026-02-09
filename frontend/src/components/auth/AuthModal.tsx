import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff } from 'lucide-react';
import { useUserStore } from '../../store/userStore';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const login = useUserStore(state => state.login);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate auth
        if (email && password) {
            login({
                name: name || email.split('@')[0],
                email
            });
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-4xl flex flex-col md:flex-row min-h-[500px] z-10"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-20 p-2 bg-white/50 hover:bg-white rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>

                    {/* Left: Image Side */}
                    <div className="w-full md:w-1/2 bg-gray-100 relative hidden md:block">
                        <img
                            src="/assets/hero_meat_platter_2.jpg"
                            alt="Welcome"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-8 text-white">
                            <h2 className="text-3xl font-display font-bold mb-2">Fresh Meets Quality</h2>
                            <p className="opacity-90">Join our community for exclusive deals and faster checkout.</p>
                        </div>
                    </div>

                    {/* Right: Form Side */}
                    <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">
                                {isLogin ? 'Welcome Back!' : 'Create Account'}
                            </h2>
                            <p className="text-gray-500">
                                {isLogin ? "Don't have an account? " : "Already have an account? "}
                                <button
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="text-primary font-bold hover:underline"
                                >
                                    {isLogin ? 'Sign Up' : 'Log In'}
                                </button>
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && (
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-3 bg-red-50 rounded-xl border-none focus:ring-2 focus:ring-primary/20 outline-none text-gray-800 placeholder-gray-400"
                                        required
                                    />
                                </div>
                            )}

                            <div>
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-red-50 rounded-xl border-none focus:ring-2 focus:ring-primary/20 outline-none text-gray-800 placeholder-gray-400"
                                    required
                                />
                            </div>

                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-red-50 rounded-xl border-none focus:ring-2 focus:ring-primary/20 outline-none text-gray-800 placeholder-gray-400"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-red-800 transition-colors shadow-lg shadow-primary/30 mt-4"
                            >
                                {isLogin ? 'Sign In' : 'Create Account'}
                            </button>
                        </form>


                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
