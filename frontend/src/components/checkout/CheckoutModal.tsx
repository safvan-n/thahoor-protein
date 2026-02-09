import { useState } from 'react';
import { X, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import qrCode from '../../assets/payment-qr.jpg';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (details: { name: string; phone: string; address: any; location: any; paymentMethod: 'COD' | 'Online'; paymentProof?: string }) => void;
    totalAmount: number;
}

export function CheckoutModal({ isOpen, onClose, onSubmit, totalAmount }: CheckoutModalProps) {
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ name, phone, address, location, paymentMethod, paymentProof });
    };

    const getCurrentLocation = () => {
        setLoadingLocation(true);
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setLoadingLocation(false);
                },
                (error) => {
                    console.error("Error getting location", error);
                    setLoadingLocation(false);
                    let errorMessage = "Could not get location.";
                    if (error.code === 1) errorMessage = "Location permission denied.";
                    else if (error.code === 2) errorMessage = "Location unavailable.";
                    else if (error.code === 3) errorMessage = "Location request timed out.";
                    alert(`${errorMessage} Please enter address manually.`);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        } else {
            setLoadingLocation(false);
            alert("Geolocation is not supported by your browser");
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto"
                >
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Checkout</h2>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Receiver's Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                                <input
                                    required
                                    type="tel"
                                    placeholder="Enter 10-digit mobile number"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="block text-sm font-medium text-gray-700">Delivery Address <span className="text-red-500">*</span></label>
                                    <button
                                        type="button"
                                        onClick={getCurrentLocation}
                                        disabled={loadingLocation}
                                        className="text-xs flex items-center gap-1 text-primary hover:text-red-700 font-medium transition-colors"
                                    >
                                        <MapPin size={14} />
                                        {loadingLocation ? 'Locating...' : 'Use Current Location'}
                                    </button>
                                </div>

                                {location && (
                                    <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-xs flex items-center gap-2">
                                        <MapPin size={14} /> Location captured (Will be shared on WhatsApp)
                                    </div>
                                )}

                                <input
                                    required
                                    placeholder="House No., Building Name, Street"
                                    value={address.street}
                                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                />

                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        required
                                        placeholder="City"
                                        value={address.city}
                                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                    />
                                    <input
                                        required
                                        placeholder="Pincode"
                                        value={address.pincode}
                                        onChange={(e) => setAddress({ ...address, pincode: e.target.value.slice(0, 6) })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                    />
                                </div>

                                <input
                                    placeholder="Landmark (Optional)"
                                    value={address.landmark}
                                    onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                />
                            </div>

                            <div className="pt-4 border-t border-gray-100 mt-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="COD"
                                            checked={paymentMethod === 'COD'}
                                            onChange={() => setPaymentMethod('COD')}
                                            className="accent-green-600 w-4 h-4"
                                        />
                                        <span>Cash on Delivery</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="Online"
                                            checked={paymentMethod === 'Online'}
                                            onChange={() => setPaymentMethod('Online')}
                                            className="accent-green-600 w-4 h-4"
                                        />
                                        <span>Online Payment</span>
                                    </label>
                                </div>

                                {paymentMethod === 'Online' && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center text-center">
                                        <div className="mb-2 w-48 h-48 bg-white p-2 rounded-lg shadow-sm">
                                            <img src={qrCode} alt="Payment QR" className="w-full h-full object-contain" />
                                        </div>
                                        <p className="font-bold text-gray-800 mb-1">+91 96052 06865</p>
                                        <p className="text-xs text-gray-500 mb-4">Scan QR or Pay to this number</p>

                                        <div className="w-full">
                                            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Upload Screenshot <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <input
                                                    required
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                                                />
                                            </div>
                                            {paymentProof && <p className="text-xs text-green-600 mt-1 text-left">Screenshot loaded successfully</p>}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-gray-100 mt-6">
                                <div className="flex justify-between items-center mb-4 text-sm text-gray-600">
                                    <span>Total Amount to Pay</span>
                                    <span className="font-bold text-lg text-primary">₹{totalAmount.toFixed(0)}</span>
                                </div>
                                <button
                                    type="submit"
                                    disabled={!name || !phone || !address.street || !address.city || !address.pincode || (paymentMethod === 'Online' && !paymentProof)}
                                    className="w-full py-3.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-200"
                                >
                                    Confirm Order & WhatsApp
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
