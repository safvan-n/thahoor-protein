import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    updateProfile,
    sendPasswordResetEmail,
    signInWithPopup,
    GoogleAuthProvider
} from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { useUserStore } from '../../store/userStore';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type AuthMode = 'login' | 'signup' | 'forgot-password';

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const login = useUserStore(state => state.login);

    const resetStates = () => {
        setError('');
        setSuccessMsg('');
        setLoading(false);
    };

    const handleModeSwitch = (newMode: AuthMode) => {
        setMode(newMode);
        resetStates();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        resetStates();

        if (mode === 'signup' && password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6 && mode !== 'forgot-password') {
            setError('Password should be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            if (mode === 'signup') {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName: name });
                
                // Register as customer
                await setDoc(doc(db, 'customers', email.toLowerCase()), {
                    name,
                    email: email.toLowerCase(),
                    role: 'customer',
                    createdAt: serverTimestamp()
                }, { merge: true });

                login({
                    name: name,
                    email: email,
                    uid: userCredential.user.uid
                });
                onClose();
            } else if (mode === 'login') {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                login({
                    name: userCredential.user.displayName || email.split('@')[0],
                    email: email,
                    uid: userCredential.user.uid
                });
                onClose();
            } else if (mode === 'forgot-password') {
                await sendPasswordResetEmail(auth, email);
                setSuccessMsg('Password reset link sent to your email!');
            }
        } catch (err: any) {
            console.error('Auth Error:', err);
            let message = 'An error occurred. Please try again.';
            if (err.code === 'auth/user-not-found') message = 'No account found with this email.';
            else if (err.code === 'auth/wrong-password') message = 'Incorrect password.';
            else if (err.code === 'auth/email-already-in-use') message = 'Email already in use.';
            else if (err.code === 'auth/invalid-email') message = 'Invalid email address.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);
            
            // Register as customer
            await setDoc(doc(db, 'customers', userCredential.user.email?.toLowerCase() || userCredential.user.uid), {
                name: userCredential.user.displayName,
                email: userCredential.user.email,
                role: 'customer',
                lastLogin: serverTimestamp()
            }, { merge: true });

            login({
                name: userCredential.user.displayName || 'User',
                email: userCredential.user.email || '',
                uid: userCredential.user.uid
            });
            onClose();
        } catch (err: any) {
            console.error('Google login failed:', err);
            setError('Google sign-in was interrupted. Please try again.');
        } finally {
            setLoading(false);
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
                                {mode === 'login' && 'Welcome Back!'}
                                {mode === 'signup' && 'Create Account'}
                                {mode === 'forgot-password' && 'Reset Password'}
                            </h2>
                            <p className="text-gray-500">
                                {mode === 'login' && (
                                    <>
                                        Don't have an account?{' '}
                                        <button onClick={() => handleModeSwitch('signup')} className="text-primary font-bold hover:underline">Sign Up</button>
                                    </>
                                )}
                                {mode === 'signup' && (
                                    <>
                                        Already have an account?{' '}
                                        <button onClick={() => handleModeSwitch('login')} className="text-primary font-bold hover:underline">Log In</button>
                                    </>
                                )}
                                {mode === 'forgot-password' && (
                                    <>
                                        Remember your password?{' '}
                                        <button onClick={() => handleModeSwitch('login')} className="text-primary font-bold hover:underline">Log In</button>
                                    </>
                                )}
                            </p>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm">
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        {successMsg && (
                            <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-xl flex items-center gap-2 text-sm">
                                <CheckCircle2 size={18} />
                                {successMsg}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {mode === 'signup' && (
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

                            {mode !== 'forgot-password' && (
                                <>
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

                                    {mode === 'signup' && (
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="Confirm Password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full px-4 py-3 bg-red-50 rounded-xl border-none focus:ring-2 focus:ring-primary/20 outline-none text-gray-800 placeholder-gray-400"
                                                required
                                            />
                                        </div>
                                    )}

                                    {mode === 'login' && (
                                        <div className="text-right">
                                            <button
                                                type="button"
                                                onClick={() => handleModeSwitch('forgot-password')}
                                                className="text-sm text-gray-500 hover:text-primary transition-colors"
                                            >
                                                Forgot Password?
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-red-800 transition-all shadow-lg shadow-primary/30 mt-4 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        {mode === 'login' && 'Sign In'}
                                        {mode === 'signup' && 'Create Account'}
                                        {mode === 'forgot-password' && 'Send Reset Link'}
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-6 flex flex-col items-center">
                            <div className="relative w-full mb-6 flex items-center justify-center">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-100"></div>
                                </div>
                                <span className="relative bg-white px-4 text-xs text-gray-400 font-bold uppercase tracking-widest">Or login with</span>
                            </div>

                            <button
                                onClick={handleGoogleLogin}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-bold text-gray-700 active:scale-[0.98] disabled:opacity-50"
                            >
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                                Google
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
