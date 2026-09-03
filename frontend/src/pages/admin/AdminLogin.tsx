import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Shield, Loader2, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';

export function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
            
            // Force token refresh to fetch the latest custom claims
            const idTokenResult = await userCredential.user.getIdTokenResult(true);

            if (idTokenResult.claims.admin === true) {
                navigate('/admin/dashboard');
            } else {
                // If not an authorized admin, sign out immediately
                await auth.signOut();
                setError('Access denied: You do not have administrator privileges.');
            }
        } catch (err: any) {
            console.error('Admin login error:', err);
            let message = 'Invalid admin credentials.';
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                message = 'Invalid email or password.';
            } else if (err.code === 'auth/too-many-requests') {
                message = 'Too many failed login attempts. Please try again later.';
            } else if (err.code === 'auth/invalid-email') {
                message = 'Please enter a valid email address.';
            } else if (err.message) {
                message = err.message;
            }
            setError(message);
        } finally {
            setLoading(false);
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
                        <Shield className="text-primary" size={32} />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">Admin Portal</h2>
                <p className="text-center text-xs text-gray-500 mb-6 uppercase tracking-wider font-semibold">
                    Secure Administrator Sign In
                </p>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center font-medium border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
                        <div className="relative">
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
                                placeholder="admin@thahoorprotein.com"
                                disabled={loading}
                            />
                            <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
                                placeholder="••••••••"
                                disabled={loading}
                            />
                            <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-red-800 transition-colors shadow-lg shadow-primary/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                <span>Authenticating...</span>
                            </>
                        ) : (
                            <span>Sign In as Admin</span>
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
