import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
    collection, 
    onSnapshot, 
    query, 
    doc, 
    updateDoc, 
    orderBy,
    limit,
    setDoc,
    serverTimestamp
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, MapPin, CheckCircle2, Phone, MessageSquare, LogOut, Package, ClipboardList, Navigation, User, ShieldAlert, Power, XCircle } from 'lucide-react';

export function DeliveryDashboard() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'assigned' | 'history' | 'profile'>('assigned');
    const [driverInfo, setDriverInfo] = useState<{ email: string; name: string } | null>(null);
    const [isUnauthorized, setIsUnauthorized] = useState(false);
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        const authUnsubscribe = onAuthStateChanged(auth, async (user) => {
            const isDriver = localStorage.getItem('isDriver');
            if (!isDriver) {
                navigate('/delivery/login');
                return;
            }

            if (user) {
                const dEmail = user.email || '';
                const dName = user.displayName || 'Fleet Pilot';

                // Check if user is a registered driver
                const { getDoc } = await import('firebase/firestore');
                const driverDoc = await getDoc(doc(db, 'drivers', dEmail.toLowerCase()));
                
                if (!driverDoc.exists()) {
                    setIsUnauthorized(true);
                    setLoading(false);
                    return;
                }

                const data = driverDoc.data();
                setIsOnline(data?.status === 'online');
                setDriverInfo({ email: dEmail, name: dName });

                // Presence sync
                const driverRef = doc(db, 'drivers', dEmail.toLowerCase());
                setDoc(driverRef, {
                    name: dName,
                    email: dEmail.toLowerCase(),
                    lastActive: serverTimestamp()
                }, { merge: true });

                // Orders listener
                const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(100));
                const ordersUnsubscribe = onSnapshot(q, (snapshot) => {
                    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
                    const filtered = list.filter(o => 
                        o.assignedTo === dEmail.toLowerCase() || 
                        (dEmail === 'default-driver' && o.assignedTo === 'default-driver')
                    );
                    setOrders(filtered);
                    setLoading(false);
                }, (err) => {
                    console.error('Orders failed:', err);
                    setLoading(false);
                });

                return () => ordersUnsubscribe();
            } else {
                navigate('/delivery/login');
            }
        });

        return () => authUnsubscribe();
    }, [navigate]);

    const togglePresence = async () => {
        if (!driverInfo?.email) return;
        const newStatus = isOnline ? 'offline' : 'online';
        try {
            await updateDoc(doc(db, 'drivers', driverInfo.email.toLowerCase()), {
                status: newStatus,
                lastActive: serverTimestamp()
            });
            setIsOnline(!isOnline);
        } catch (err) {
            console.error("Presence toggle failed", err);
        }
    };

    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        try {
            await updateDoc(doc(db, 'orders', orderId), {
                status: newStatus,
                updatedAt: new Date().toISOString()
            });
        } catch (err) {
            console.error('Update failed:', err);
            alert("Status update failed");
        }
    };

    const handleRejectTask = async (orderId: string) => {
        if (!confirm("Are you sure you want to REJECT this task? It will be sent back to the admin for re-assignment.")) return;
        
        try {
            await updateDoc(doc(db, 'orders', orderId), {
                assignedTo: null,
                driverName: null,
                updatedAt: new Date().toISOString()
            });
        } catch (err) {
            console.error('Rejection failed:', err);
            alert("Failed to reject task");
        }
    };

    const handleLogout = async () => {
        if (driverInfo?.email) {
            await setDoc(doc(db, 'drivers', driverInfo.email.toLowerCase()), { status: 'offline' }, { merge: true });
        }
        localStorage.removeItem('isDriver');
        await auth.signOut();
        navigate('/delivery/login');
    };

    const handleNavigate = (order: any) => {
        if (order.customer.location) {
            window.open(`https://www.google.com/maps?q=${order.customer.location.lat},${order.customer.location.lng}`, '_blank');
        } else {
            const addr = `${order.customer.address.street}, ${order.customer.address.city}`;
            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`, '_blank');
        }
    };

    const handleWhatsApp = (phone: string, order: any) => {
        const text = `Hi ${order.customer.name}, I am from Thahoor Protein delivering your order #${order.orderId || order.id.slice(-6)}. I'll be there soon.`;
        window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(text)}`, '_blank');
    };

    if (isUnauthorized) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                <div className="bg-white p-10 rounded-[40px] shadow-2xl text-center max-w-sm border border-gray-100">
                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-500/10">
                        <ShieldAlert size={40} strokeWidth={2.5} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">ACCESS DENIED</h2>
                    <p className="text-sm text-gray-400 font-bold mb-8 leading-relaxed uppercase tracking-wider">Your account is not registered in the official fleet directory.</p>
                    <button onClick={handleLogout} className="w-full bg-primary text-white py-4 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20">Return to Portal</button>
                </div>
            </div>
        );
    }

    const filteredOrders = orders.filter(o => activeTab === 'assigned' ? !['Delivered', 'Cancelled'].includes(o.status) : o.status === 'Delivered');

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto relative overflow-x-hidden font-sans pb-24">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-xl px-6 py-6 sticky top-0 z-40 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center text-primary shadow-lg shadow-primary/5">
                        <Truck size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-gray-900 tracking-tight leading-none uppercase">Thahoor <span className="text-primary tracking-normal font-medium">Fleet</span></h1>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></span>
                            {driverInfo?.name || 'Driver'} {isOnline ? 'Online' : 'Offline'}
                        </p>
                    </div>
                </div>
                <button onClick={() => setActiveTab('profile')} className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-primary transition-all">
                    <User size={24} />
                </button>
            </header>

            {/* List View */}
            <AnimatePresence mode="wait">
                {activeTab !== 'profile' ? (
                    <motion.div 
                        key="orders"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="px-4 py-6 space-y-6"
                    >
                        {/* Tab Switcher inside view */}
                        <div className="flex gap-2 mb-8 bg-gray-100/50 p-1.5 rounded-3xl">
                            <button 
                                onClick={() => setActiveTab('assigned')}
                                className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'assigned' ? 'bg-white text-gray-900 shadow-lg' : 'text-gray-400'}`}
                            >
                                Active Tasks ({orders.filter(o => !['Delivered', 'Cancelled'].includes(o.status)).length})
                            </button>
                            <button 
                                onClick={() => setActiveTab('history')}
                                className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-white text-gray-900 shadow-lg' : 'text-gray-400'}`}
                            >
                                History
                            </button>
                        </div>

                        {loading ? (
                            <div className="py-20 text-center">
                                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Syncing Fleet Data...</p>
                            </div>
                        ) : filteredOrders.length === 0 ? (
                            <div className="py-20 text-center grayscale opacity-50">
                                <Package size={64} className="mx-auto mb-4 text-gray-300" />
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No Records Found</p>
                            </div>
                        ) : (
                            filteredOrders.map(order => (
                                <div key={order.id} className="bg-white rounded-[40px] p-8 shadow-xl border border-gray-50/50 relative">
                                    <div className="absolute top-8 right-8">
                                        <div className="bg-green-500 text-white px-4 py-2 rounded-2xl font-black text-xl shadow-lg shadow-green-500/20">
                                            ₹{order.totalAmount}
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-1 mb-8">
                                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">#{order.orderId || order.id.slice(-6)}</h3>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{order.paymentMethod === 'COD' ? '💰 Collect Cash' : '✅ Paid Online'}</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 shrink-0">
                                                <Navigation size={22} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1.5">Delivery Address</p>
                                                <h4 className="font-bold text-gray-900 leading-tight">{order.customer.name}</h4>
                                                <p className="text-xs text-gray-500 font-medium mt-1 leading-relaxed">{order.customer.address.street}, {order.customer.address.landmark}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button onClick={() => window.open(`tel:${order.customer.phone}`, '_self')} className="flex-1 bg-blue-50 text-blue-600 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-100 transition-all border border-blue-100">
                                                <Phone size={14} /> Call
                                            </button>
                                            <button onClick={() => handleWhatsApp(order.customer.phone, order)} className="flex-1 bg-green-50 text-green-600 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-green-100 transition-all border border-green-100">
                                                <MessageSquare size={14} /> WhatsApp
                                            </button>
                                            <button onClick={() => handleNavigate(order)} className="w-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-gray-900/20 active:scale-95 transition-all">
                                                <MapPin size={22} />
                                            </button>
                                        </div>

                                        <div className="pt-6 border-t border-gray-50">
                                            {order.status === 'Confirmed' && (
                                                <div className="flex flex-col gap-3">
                                                    <button onClick={() => handleUpdateStatus(order.id, 'On the Way')} className="w-full bg-primary text-white py-4.5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-[0.98]">
                                                        <Truck size={20} /> Mark Picked Up
                                                    </button>
                                                    <button 
                                                        onClick={() => handleRejectTask(order.id)}
                                                        className="w-full py-3 text-red-400 font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-50 rounded-2xl transition-all"
                                                    >
                                                        <XCircle size={14} /> Reject this Task
                                                    </button>
                                                </div>
                                            )}
                                            {order.status === 'On the Way' && (
                                                <button onClick={() => handleUpdateStatus(order.id, 'Delivered')} className="w-full bg-green-600 text-white py-4.5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-green-600/20 flex items-center justify-center gap-3 active:scale-[0.98]">
                                                    <CheckCircle2 size={20} /> Complete Order
                                                </button>
                                            )}
                                            {order.status === 'Delivered' && (
                                                <div className="w-full bg-green-50 text-green-600 py-4.5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] text-center border border-green-100 flex items-center justify-center gap-2">
                                                    <CheckCircle2 size={18} /> Successfully Delivered
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </motion.div>
                ) : (
                    <motion.div 
                        key="profile"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="px-6 py-8 space-y-6"
                    >
                        <div className="bg-white rounded-[40px] p-10 shadow-2xl text-center relative overflow-hidden border border-gray-50">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                            <div className="bg-primary/10 w-24 h-24 rounded-[32px] flex items-center justify-center text-primary mx-auto mb-6 shadow-xl shadow-primary/10 transform rotate-6 animate-pulse">
                                <User size={48} strokeWidth={2.5} />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-none uppercase">{driverInfo?.name}</h2>
                            <p className="text-[10px] font-black text-gray-400 mt-2 uppercase tracking-widest">{driverInfo?.email}</p>
                            
                            <div className="mt-10 grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-5 rounded-[32px] border border-gray-100">
                                    <p className="text-[9px] font-black text-gray-400 underline uppercase tracking-widest mb-2">Success Rate</p>
                                    <p className="text-2xl font-black text-primary">100%</p>
                                </div>
                                <div className="bg-gray-50 p-5 rounded-[32px] border border-gray-100">
                                    <p className="text-[9px] font-black text-gray-400 underline uppercase tracking-widest mb-2">Total Deliveries</p>
                                    <p className="text-2xl font-black text-primary">{orders.filter(o => o.status === 'Delivered').length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[40px] p-6 shadow-lg border border-gray-50 space-y-4">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-4">Duty Status</h3>
                            
                            <button 
                                onClick={togglePresence}
                                className={`w-full py-5 rounded-[30px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${
                                    isOnline 
                                    ? 'bg-green-50 text-green-600 border border-green-100' 
                                    : 'bg-gray-50 text-gray-400 border border-gray-100'
                                }`}
                            >
                                <Power size={18} />
                                {isOnline ? 'You are Online' : 'You are Offline'}
                            </button>

                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-4 mt-6">Account Safety</h3>
                            <button 
                                onClick={handleLogout}
                                className="w-full bg-red-50 text-red-600 py-5 rounded-[30px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
                            >
                                <LogOut size={18} /> Sign Out Partner
                            </button>
                        </div>
                        
                        <div className="text-center py-4">
                            <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest italic">Official Fleet Application v1.2.0</p>
                            <p className="text-[9px] font-black text-primary uppercase tracking-widest mt-1 underline cursor-pointer" onClick={() => window.open('mailto:thahoorprotein@gmail.com')}>Get Station Support</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sticky Nav Bar */}
            <div className="fixed bottom-6 left-6 right-6 z-50">
                <div className="bg-gray-900/90 backdrop-blur-2xl rounded-[32px] p-2 flex items-center shadow-2xl border border-white/10 overflow-hidden">
                    <button 
                        onClick={() => setActiveTab('assigned')}
                        className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-3 transition-all ${activeTab === 'assigned' ? 'bg-white text-gray-900 shadow-xl' : 'text-gray-500'}`}
                    >
                        <ClipboardList size={20} strokeWidth={activeTab === 'assigned' ? 2.5 : 2} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${activeTab === 'assigned' ? 'block' : 'hidden'}`}>Tasks</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-3 transition-all ${activeTab === 'history' ? 'bg-white text-gray-900 shadow-xl' : 'text-gray-500'}`}
                    >
                        <Package size={20} strokeWidth={activeTab === 'history' ? 2.5 : 2} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${activeTab === 'history' ? 'block' : 'hidden'}`}>History</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('profile')}
                        className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-3 transition-all ${activeTab === 'profile' ? 'bg-white text-gray-900 shadow-xl' : 'text-gray-500'}`}
                    >
                        <User size={20} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${activeTab === 'profile' ? 'block' : 'hidden'}`}>Me</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
