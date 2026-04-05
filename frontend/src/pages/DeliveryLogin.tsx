import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Lock, ArrowRight, Loader2, Mail, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export function DeliveryLogin() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isSignUp) {
                // Sign Up logic
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName: name });
                
                // Register in drivers collection
                await setDoc(doc(db, 'drivers', email.toLowerCase()), {
                    name,
                    email: email.toLowerCase(),
                    role: 'driver',
                    status: 'online',
                    lastActive: serverTimestamp()
                }, { merge: true });

            } else {
                // Sign In logic
                await signInWithEmailAndPassword(auth, email, password);
                
                // Verify they are in the drivers collection
                const { getDoc } = await import('firebase/firestore');
                const driverDoc = await getDoc(doc(db, 'drivers', email.toLowerCase()));
                if (!driverDoc.exists()) {
                    // Auto-register if they exist in auth but not in drivers (fallback)
                    await setDoc(doc(db, 'drivers', email.toLowerCase()), {
                        name: auth.currentUser?.displayName || 'Fleet Pilot',
                        email: email.toLowerCase(),
                        role: 'driver',
                        status: 'online',
                        lastActive: serverTimestamp()
                    }, { merge: true });
                }
            }
            
            localStorage.setItem('isDriver', 'true');
            navigate('/delivery');
        } catch (err: any) {
            console.error('Auth failed:', err);
            let message = 'Access denied. Check your credentials.';
            if (err.code === 'auth/email-already-in-use') message = 'This email is already registered.';
            else if (err.code === 'auth/weak-password') message = 'Choose a stronger password (6+ chars).';
            else if (err.code === 'auth/user-not-found') message = 'No pilot found with this email. Join us!';
            else if (err.code === 'auth/wrong-password') message = 'Incorrect passcode. Please try again.';
            else if (err.code === 'auth/invalid-credential') message = 'Invalid credentials. Please verify your details.';
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
            const result = await signInWithPopup(auth, provider);
            
            // Auto register presence for Google users
            if (result.user.email) {
                await setDoc(doc(db, 'drivers', result.user.email.toLowerCase()), {
                    name: result.user.displayName || 'Fleet Member',
                    email: result.user.email.toLowerCase(),
                    status: 'online',
                    lastActive: serverTimestamp()
                }, { merge: true });
            }

            localStorage.setItem('isDriver', 'true');
            navigate('/delivery');
        } catch (err: any) {
            console.error('Google login failed:', err);
            let message = 'Auth failed. Please try again.';
            if (err.code === 'auth/popup-closed-by-user') message = 'Login cancelled. Please try again.';
            else if (err.code === 'auth/unauthorized-domain') message = 'This domain is not authorized for login.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 max-w-md mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full bg-white p-8 rounded-[40px] shadow-2xl border border-white relative overflow-hidden"
            >
                {/* Visual Flair */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>

                <div className="flex justify-center mb-8">
                    <div className="bg-primary/10 w-24 h-24 rounded-[32px] flex items-center justify-center text-primary shadow-xl shadow-primary/20 transform -rotate-6">
                        <Truck size={48} strokeWidth={2.5} />
                    </div>
                </div>

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">FLEET <span className="text-primary font-medium tracking-normal text-sm ml-1 uppercase">Portal</span></h2>
                    <p className="text-sm text-gray-400 font-bold mt-2 uppercase tracking-widest italic opacity-60">
                        {isSignUp ? 'Join the Fleet Team' : 'Fleet Station Login'}
                    </p>
                </div>

                {error && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-xs text-center font-black border border-red-100 uppercase tracking-wider"
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleAuth} className="space-y-6">
                    <AnimatePresence mode="wait">
                        {isSignUp && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-1.5"
                            >
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Full Name</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-6 py-4.5 bg-gray-50 border-2 border-gray-100 rounded-3xl focus:bg-white focus:border-primary/50 outline-none transition-all text-sm font-bold placeholder-gray-300"
                                        placeholder="Arjun K"
                                        required={isSignUp}
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300">
                                        <User size={18} />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Email Address</label>
                        <div className="relative">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-6 py-4.5 bg-gray-50 border-2 border-gray-100 rounded-3xl focus:bg-white focus:border-primary/50 outline-none transition-all text-sm font-bold placeholder-gray-300"
                                placeholder="fleet@example.com"
                                required
                            />
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300">
                                <Mail size={18} />
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Passcode</label>
                        <div className="relative">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-6 py-4.5 bg-gray-50 border-2 border-gray-100 rounded-3xl focus:bg-white focus:border-primary/50 outline-none transition-all text-sm font-bold placeholder-gray-300"
                                placeholder="••••••••"
                                required
                            />
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300">
                                <Lock size={18} />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-5 rounded-3xl font-black text-sm uppercase tracking-[0.2em] hover:bg-red-800 transition-all shadow-2xl shadow-primary/40 flex items-center justify-center gap-3 group active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (
                            <>
                                {isSignUp ? 'Join Fleet' : 'Fleet Access'}
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-primary transition-colors"
                    >
                        {isSignUp ? 'Already a pilot? Sign In' : 'New pilot? Join the Fleet'}
                    </button>
                </div>

                <div className="mt-8">
                    <div className="relative mb-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-100"></div>
                        </div>
                        <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                            <span className="bg-white px-4 text-gray-300">OR QUICK ACCESS</span>
                        </div>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full bg-white border-2 border-gray-100 text-gray-700 py-4.5 rounded-3xl font-bold text-sm tracking-tight hover:bg-gray-50 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin text-primary" size={20} />
                        ) : (
                            <>
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                                Google Driver ID
                            </>
                        )}
                    </button>
                </div>
                
                <p className="text-center mt-10 text-[10px] font-bold text-gray-300 uppercase tracking-widest line-clamp-1">© Thahoor Protein Fleet Management v1.1</p>
            </motion.div>
        </div>
    );
}

