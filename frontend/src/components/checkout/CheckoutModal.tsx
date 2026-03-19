import { useState } from 'react';
import { X, MapPin, CheckCircle2, QrCode, CreditCard, Banknote, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import qrCode from '../../assets/payment-qr.jpg';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (details: { name: string; phone: string; address: any; location: any; paymentMethod: 'COD' | 'Online'; paymentProof?: string }) => void;
    totalAmount: number;
}

export function CheckoutModal({ isOpen, onClose, onSubmit, totalAmount }: CheckoutModalProps) {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState({
        street: '',
        city: '',
        pincode: '',
        landmark: ''
    });
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Online'>('COD');
    const [paymentProof, setPaymentProof] = useState<string>('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPaymentProof(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleNext = () => setStep(step < 3 ? (step + 1) as 1 | 2 | 3 : 3);
    const handleBack = () => setStep(step > 1 ? (step - 1) as 1 | 2 | 3 : 1);

    const handleSubmit = () => {
        onSubmit({ name, phone, address, location, paymentMethod, paymentProof });
    };

    const getCurrentLocation = () => {
        setLoadingLocation(true);
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude, accuracy } = position.coords;
                    
                    setLocation({
                        lat: latitude,
                        lng: longitude
                    });

                    // Reverse Geocode to auto-fill the address
                    try {
                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                        const data = await res.json();
                        if (data && data.address) {
                            setAddress(prev => ({
                                ...prev,
                                city: data.address.city || data.address.town || data.address.village || data.address.county || prev.city,
                                pincode: data.address.postcode || prev.pincode,
                                street: data.address.road ? `${data.address.road}, ${data.address.suburb || ''}`.replace(/, $/, '') : prev.street
                            }));
                        }
                    } catch (error) {
                        console.error("Reverse geocoding failed", error);
                    }
                    
                    if (accuracy > 1000) {
                        alert("Note: Device GPS accuracy is currently low. Please verify your auto-detected address.");
                    }

                    setLoadingLocation(false);
                },
                (error) => {
                    console.error("Error getting location", error);
                    setLoadingLocation(false);
                    let errorMessage = "Could not get location.";
                    if (error.code === 1) errorMessage = "Please enable Location permission in your device/browser settings.";
                    else if (error.code === 2) errorMessage = "Network or GPS issue. Location unavailable.";
                    else if (error.code === 3) errorMessage = "Location request timed out. Try moving to a better spot.";
                    alert(`${errorMessage} Please enter address manually.`);
                },
                { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
            );
        } else {
            setLoadingLocation(false);
            alert("Geolocation is not supported by your browser");
        }
    };

    if (!isOpen) return null;

    const isStep1Valid = name.trim() !== '' && phone.length >= 10;
    const isStep2Valid = address.street.trim() !== '' && address.city.trim() !== '' && address.pincode.length >= 6;
    const isStep3Valid = paymentMethod === 'COD' || (paymentMethod === 'Online' && paymentProof !== '');

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0 sm:items-end md:items-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />
                
                <motion.div
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="relative w-full max-w-lg bg-white sm:rounded-3xl rounded-t-3xl sm:rounded-b-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh]"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <ShoppingBag size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Checkout</h2>
                                <p className="text-xs text-gray-500 font-medium">Step {step} of 3</p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1 bg-gray-100 w-full relative overflow-hidden">
                        <motion.div 
                            className="absolute top-0 left-0 h-full bg-primary"
                            initial={{ width: `${((step - 1) / 3) * 100}%` }}
                            animate={{ width: `${(step / 3) * 100}%` }}
                            transition={{ ease: "easeInOut", duration: 0.3 }}
                        />
                    </div>

                    {/* Form Content */}
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* STEP 1: Personal Details */}
                                {step === 1 && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">Contact Details</h3>
                                            <p className="text-sm text-gray-500">We'll use this to notify you about your order.</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-gray-900"
                                                    placeholder="John Doe"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">+91</span>
                                                    <input
                                                        type="tel"
                                                        value={phone}
                                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-gray-900"
                                                        placeholder="98765 43210"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 2: Delivery Address */}
                                {step === 2 && (
                                    <div className="space-y-6">
                                         <div className="flex flex-col gap-4 mb-2">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-1">Delivery Address</h3>
                                                <p className="text-sm text-gray-500">Where should we send your fresh cuts?</p>
                                            </div>
                                            
                                            <button
                                                type="button"
                                                onClick={getCurrentLocation}
                                                disabled={loadingLocation}
                                                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold transition-colors border border-blue-200 shadow-sm"
                                            >
                                                {loadingLocation ? (
                                                    <>
                                                        <MapPin size={18} className="animate-bounce" />
                                                        Detecting pinpoint location...
                                                    </>
                                                ) : (
                                                    <>
                                                        <MapPin size={18} />
                                                        Use Exact GPS Location
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        {location && (
                                            <div className="bg-green-50 border border-green-100 p-3 rounded-xl flex items-center gap-3 text-green-700 text-sm">
                                                <CheckCircle2 size={18} className="shrink-0" />
                                                <span className="font-medium">GPS Location attached successfully</span>
                                            </div>
                                        )}

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Street / Building info</label>
                                                <input
                                                    type="text"
                                                    value={address.street}
                                                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                                                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-gray-900"
                                                    placeholder="House No, Apartment Name"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">City</label>
                                                    <input
                                                        type="text"
                                                        value={address.city}
                                                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-gray-900"
                                                        placeholder="Your City"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pincode</label>
                                                    <input
                                                        type="text"
                                                        value={address.pincode}
                                                        onChange={(e) => setAddress({ ...address, pincode: e.target.value.slice(0, 6) })}
                                                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-gray-900"
                                                        placeholder="000000"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Landmark (Optional)</label>
                                                <input
                                                    type="text"
                                                    value={address.landmark}
                                                    onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                                                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-gray-900"
                                                    placeholder="E.g. Near Apollo Hospital"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 3: Payment */}
                                {step === 3 && (
                                    <div className="space-y-6">
                                         <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">Payment Method</h3>
                                            <p className="text-sm text-gray-500">Choose how you want to pay</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <label 
                                                className={`relative flex flex-col p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                                                    paymentMethod === 'COD' 
                                                    ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10' 
                                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="paymentMethod"
                                                    value="COD"
                                                    checked={paymentMethod === 'COD'}
                                                    onChange={() => setPaymentMethod('COD')}
                                                    className="sr-only"
                                                />
                                                <div className="flex items-center gap-3 mb-1">
                                                    <div className={`p-2 rounded-full ${paymentMethod === 'COD' ? 'bg-primary/20 text-primary' : 'bg-gray-100 text-gray-500'}`}>
                                                        <Banknote size={18} />
                                                    </div>
                                                    <span className="font-bold text-gray-900">Cash on Delivery</span>
                                                </div>
                                                <span className="text-xs text-gray-500 ml-11">Pay via cash or UPI at your doorstep</span>
                                            </label>

                                            <label 
                                                className={`relative flex flex-col p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                                                    paymentMethod === 'Online' 
                                                    ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10' 
                                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="paymentMethod"
                                                    value="Online"
                                                    checked={paymentMethod === 'Online'}
                                                    onChange={() => setPaymentMethod('Online')}
                                                    className="sr-only"
                                                />
                                                <div className="flex items-center gap-3 mb-1">
                                                    <div className={`p-2 rounded-full ${paymentMethod === 'Online' ? 'bg-primary/20 text-primary' : 'bg-gray-100 text-gray-500'}`}>
                                                        <CreditCard size={18} />
                                                    </div>
                                                    <span className="font-bold text-gray-900">Pay Online</span>
                                                </div>
                                                <span className="text-xs text-gray-500 ml-11">Scan QR code now and upload proof</span>
                                            </label>
                                        </div>

                                        <AnimatePresence>
                                            {paymentMethod === 'Online' && (
                                                <motion.div 
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 mt-4">
                                                        <div className="flex flex-col items-center">
                                                            <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm mb-3">
                                                                <img src={qrCode} alt="GPay QR" className="w-32 h-32 object-contain rounded-lg" />
                                                            </div>
                                                            <p className="font-bold text-gray-900 text-lg mb-0.5">+91 96052 06865</p>
                                                            <p className="text-xs text-gray-500 mb-5">Google Pay / PhonePe / Paytm</p>
                                                            
                                                            <div className="w-full relative">
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    id="payment-proof"
                                                                    onChange={handleFileChange}
                                                                    className="hidden"
                                                                />
                                                                <label 
                                                                    htmlFor="payment-proof"
                                                                    className={`flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border-2 border-dashed transition-colors cursor-pointer ${
                                                                        paymentProof 
                                                                        ? 'border-green-400 bg-green-50 text-green-700' 
                                                                        : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-600'
                                                                    }`}
                                                                >
                                                                    {paymentProof ? (
                                                                        <>
                                                                            <CheckCircle2 size={18} />
                                                                            <span className="font-semibold text-sm">Screenshot Attached!</span>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <QrCode size={18} />
                                                                            <span className="font-medium text-sm">Upload Payment Screenshot</span>
                                                                        </>
                                                                    )}
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Footer Container */}
                    <div className="p-4 sm:p-6 bg-white border-t border-gray-100 flex flex-col gap-4">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-sm font-semibold text-gray-500">Total Estimate</span>
                            <span className="text-2xl font-bold text-primary">₹{totalAmount.toFixed(0)}</span>
                        </div>
                        
                        <div className="flex gap-3">
                            {step > 1 && (
                                <button
                                    onClick={handleBack}
                                    className="px-5 py-3.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                                >
                                    Back
                                </button>
                            )}
                            
                            {step < 3 ? (
                                <button
                                    onClick={handleNext}
                                    disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
                                    className="flex-1 py-3.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 disabled:bg-gray-300 disabled:text-gray-500 transition-all shadow-lg shadow-primary/20"
                                >
                                    Continue
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={!isStep3Valid}
                                    className="flex-1 py-3.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500 transition-all shadow-lg shadow-green-600/20 flex items-center justify-center gap-2"
                                >
                                    Complete Order
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
