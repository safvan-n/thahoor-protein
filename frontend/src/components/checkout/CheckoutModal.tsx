import { useState, useEffect } from 'react';
import { X, MapPin, CheckCircle2, Banknote, ShoppingBag, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDeliveryZoneStore } from '../../store/deliveryZoneStore';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (details: { 
        name: string; 
        phone: string; 
        address: any; 
        location: any; 
        paymentMethod: 'COD'; 
        paymentProof?: string;
        deliveryFee?: number;
        finalTotal?: number;
    }) => void;
    totalAmount: number;
}

export function CheckoutModal({ isOpen, onClose, onSubmit, totalAmount }: CheckoutModalProps) {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    
    const { zones, fetchZones, checkDeliveryAvailability } = useDeliveryZoneStore();

    useEffect(() => {
        if (isOpen) {
            fetchZones();
        }
    }, [isOpen, fetchZones]);

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
    const [paymentMethod] = useState<'COD'>('COD');
    const [paymentProof] = useState<string>('');

    const activeZones = zones.filter((z) => z.isActive);
    const deliveryCheck = checkDeliveryAvailability(address.pincode);
    const isPincodeEntered = address.pincode.replace(/\D/g, '').length === 6;

    const deliveryFee = (isPincodeEntered && deliveryCheck.isAvailable && deliveryCheck.matchedZone) 
        ? (deliveryCheck.matchedZone.deliveryFee || 0) 
        : 0;
    const finalTotal = totalAmount + deliveryFee;

    const handleNext = () => setStep(step < 3 ? (step + 1) as 1 | 2 | 3 : 3);
    const handleBack = () => setStep(step > 1 ? (step - 1) as 1 | 2 | 3 : 1);

    const handleSubmit = () => {
        onSubmit({ 
            name, 
            phone, 
            address, 
            location, 
            paymentMethod, 
            paymentProof,
            deliveryFee,
            finalTotal 
        });
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

                    // We are NOT auto-filling the address anymore at user request
                    // This ensures the user types their exact address manually while we still get the GPS pin
                    
                    if (accuracy > 1000) {
                        alert("Note: Low GPS accuracy. Please ensure you are outdoors for a better signal.");
                    } else {
                        alert("✅ GPS Location Captured successfully!");
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
    const isStep2Valid = 
        address.street.trim() !== '' && 
        address.city.trim() !== '' && 
        isPincodeEntered && 
        deliveryCheck.isAvailable;
    const isStep3Valid = true; // COD is always selected and valid

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
                                                    autoComplete="off"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">+91</span>
                                                    <input
                                                        type="tel"
                                                        inputMode="tel"
                                                        value={phone}
                                                        onChange={(e) => {
                                                            let val = e.target.value.replace(/\D/g, '');
                                                            if (val.startsWith('91') && val.length > 10) val = val.slice(2);
                                                            else if (val.startsWith('0') && val.length > 10) val = val.slice(1);
                                                            setPhone(val.slice(0, 10));
                                                        }}
                                                        onPaste={(e) => {
                                                            e.preventDefault();
                                                            const text = e.clipboardData.getData('text');
                                                            let val = text.replace(/\D/g, '');
                                                            if (val.startsWith('91') && val.length > 10) val = val.slice(2);
                                                            else if (val.startsWith('0') && val.length > 10) val = val.slice(1);
                                                            setPhone(val.slice(0, 10));
                                                        }}
                                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-gray-900 font-medium"
                                                        placeholder="98765 43210"
                                                        autoComplete="tel"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 2: Delivery Address */}
                                {step === 2 && (
                                    <div className="space-y-5">
                                        <div className="flex flex-col gap-3">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-1">Delivery Address</h3>
                                                <p className="text-sm text-gray-500">Where should we deliver your fresh cuts?</p>
                                            </div>

                                            {/* Serviceable Locations Banner */}
                                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 flex items-start gap-2.5">
                                                <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
                                                <div className="text-xs">
                                                    <span className="font-bold text-gray-900">Current Service Area: </span>
                                                    <span className="text-gray-700">
                                                        {activeZones.length > 0 
                                                            ? activeZones.map(z => `${z.name} (${z.pincodes.join(', ')})`).join(' • ')
                                                            : 'Kayamkulam Town (690502)'}
                                                    </span>
                                                    <p className="text-[11px] text-gray-500 mt-0.5">We are currently delivering exclusively in this area and expanding soon!</p>
                                                </div>
                                            </div>
                                            
                                            <button
                                                type="button"
                                                onClick={getCurrentLocation}
                                                disabled={loadingLocation}
                                                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold transition-colors border border-blue-200 shadow-sm active:scale-98"
                                            >
                                                {loadingLocation ? (
                                                    <>
                                                        <MapPin size={18} className="animate-bounce" />
                                                        Detecting pinpoint location...
                                                    </>
                                                ) : (
                                                    <>
                                                        <MapPin size={18} />
                                                        {location ? '📍 GPS Attached (Tap to re-detect)' : 'Use Exact GPS Location'}
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        {location && (
                                            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center gap-3 text-emerald-800 text-xs font-semibold">
                                                <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                                                <span>GPS Location attached successfully</span>
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
                                                    placeholder="House No, Apartment Name, Road"
                                                    autoComplete="street-address"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">City</label>
                                                    <input
                                                        type="text"
                                                        value={address.city}
                                                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-gray-900"
                                                        placeholder="Kayamkulam"
                                                        autoComplete="address-level2"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pincode</label>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        value={address.pincode}
                                                        onChange={(e) => setAddress({ ...address, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                                                        className={`w-full px-4 py-3.5 bg-gray-50 border rounded-xl focus:bg-white focus:ring-4 outline-none transition-all text-gray-900 font-semibold ${
                                                            isPincodeEntered
                                                                ? deliveryCheck.isAvailable
                                                                    ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/10'
                                                                    : 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
                                                                : 'border-gray-200 focus:border-primary focus:ring-primary/10'
                                                        }`}
                                                        placeholder="690502"
                                                        autoComplete="postal-code"
                                                    />
                                                </div>
                                            </div>

                                            {/* Pincode Availability Feedback */}
                                            {isPincodeEntered && (
                                                <div>
                                                    {deliveryCheck.isAvailable ? (
                                                        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between gap-2.5 text-emerald-800 text-xs">
                                                            <div className="flex items-center gap-2">
                                                                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                                                                <span className="font-semibold">
                                                                    Serviceable! Delivery in {deliveryCheck.matchedZone?.name || address.city}
                                                                </span>
                                                            </div>
                                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 ${
                                                                deliveryFee > 0 
                                                                    ? 'bg-primary/10 text-primary border border-primary/20' 
                                                                    : 'bg-emerald-100 text-emerald-800'
                                                            }`}>
                                                                {deliveryFee > 0 ? `+ ₹${deliveryFee} Delivery` : 'FREE Delivery'}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className="bg-red-50 border border-red-300 p-3.5 rounded-xl flex items-start gap-2.5 text-red-800 text-xs shadow-sm">
                                                            <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
                                                            <div>
                                                                <p className="font-bold text-red-900 text-sm">Delivery Not Available in {address.pincode}</p>
                                                                <p className="text-red-700 mt-1 leading-relaxed">
                                                                    Currently we are exclusively serving: <span className="font-semibold">{activeZones.map(z => `${z.name} (${z.pincodes.join(', ')})`).join(', ') || 'Kayamkulam (690502)'}</span>. We will be expanding to your area soon!
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Landmark (Optional)</label>
                                                <input
                                                    type="text"
                                                    value={address.landmark}
                                                    onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                                                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-gray-900"
                                                    placeholder="E.g. Near Kayamkulam KSRTC Stand"
                                                    autoComplete="off"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 3: Payment */}
                                {step === 3 && (
                                    <div className="space-y-5">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">Order Summary & Payment</h3>
                                            <p className="text-sm text-gray-500">Review your final payable bill</p>
                                        </div>

                                        {/* Bill Breakdown Card */}
                                        <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 space-y-2.5">
                                            <div className="flex justify-between items-center text-xs text-gray-600">
                                                <span>Products Subtotal</span>
                                                <span className="font-bold text-gray-900">₹{totalAmount.toFixed(0)}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-gray-600">
                                                    Delivery Charge ({deliveryCheck.matchedZone?.name || address.city || 'Standard'})
                                                </span>
                                                <span className={`font-bold ${deliveryFee > 0 ? 'text-primary' : 'text-emerald-600'}`}>
                                                    {deliveryFee > 0 ? `+ ₹${deliveryFee}` : 'FREE Delivery'}
                                                </span>
                                            </div>
                                            <div className="h-[1px] bg-gray-200 my-1"></div>
                                            <div className="flex justify-between items-center pt-0.5 text-sm font-bold text-gray-900">
                                                <span>Total to Pay</span>
                                                <span className="text-xl font-bold text-primary">₹{finalTotal.toFixed(0)}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3">
                                            <div 
                                                className="relative flex flex-col p-4 border-2 border-primary bg-primary/5 rounded-2xl shadow-sm shadow-primary/10"
                                            >
                                                <div className="flex items-center gap-3 mb-1">
                                                    <div className="p-2 rounded-full bg-primary/20 text-primary">
                                                        <Banknote size={18} />
                                                    </div>
                                                    <span className="font-bold text-gray-900">Cash on Delivery</span>
                                                </div>
                                                <span className="text-xs text-gray-500 ml-11">
                                                    Pay ₹{finalTotal.toFixed(0)} via cash or UPI at your doorstep
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Footer Container */}
                    <div className="p-4 sm:p-6 bg-white border-t border-gray-100 flex flex-col gap-4">
                        <div className="flex justify-between items-center px-1">
                            <div>
                                <span className="text-xs font-semibold text-gray-500 block">Total Payable</span>
                                {deliveryFee > 0 ? (
                                    <span className="text-[11px] text-gray-400">
                                        (₹{totalAmount.toFixed(0)} products + ₹{deliveryFee} delivery)
                                    </span>
                                ) : (
                                    <span className="text-[11px] text-emerald-600 font-semibold">
                                        (Free Delivery Included)
                                    </span>
                                )}
                            </div>
                            <span className="text-2xl font-bold text-primary">₹{finalTotal.toFixed(0)}</span>
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
