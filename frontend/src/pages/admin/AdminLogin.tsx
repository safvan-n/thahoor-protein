import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        // Hardcoded credentials as requested
        if (email === 'admin' && password === 'thahoor@123') {
            setLoading(true);
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/subscription/status`);
                const data = await res.json();
                
                localStorage.setItem('isAdmin', 'true');
                
                if (data.isPaid) {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/admin/pay');
                }
            } catch (err) {
                console.error("Failed to fetch subscription status:", err);
                setError("Unable to verify subscription status. Please check your connection.");
            } finally {
                setLoading(false);
            }
        } else {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md"
            >
                <div className="flex justify-center mb-6">
                    <div className="bg-primary/10 p-4 rounded-full">
                        <Lock className="text-primary" size={32} />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Admin Login</h2>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="Enter username"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="Enter password"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-red-800 transition-colors shadow-lg shadow-primary/30 disabled:opacity-75 flex items-center justify-center"
                    >
                        {loading ? 'Verifying...' : 'Login'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
