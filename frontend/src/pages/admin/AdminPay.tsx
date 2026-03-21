import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, IndianRupee, Loader2 } from 'lucide-react';

declare global {
    interface Window {
        Razorpay: any;
    }
}

export function AdminPay() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [statusData, setStatusData] = useState<any>(null);

    useEffect(() => {
        // Load Razorpay checkout script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        // Check if actually paid already
        const checkStatus = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/subscription/status`);
                const data = await res.json();
                setStatusData(data);
                
                if (data.isPaid) {
                    navigate('/admin/dashboard');
                }
            } catch (e) {
                console.error('Failed to fetch status', e);
            }
        };
        
        checkStatus();

        return () => {
            document.body.removeChild(script);
        };
    }, [navigate]);

    const handlePayment = async () => {
        setLoading(true);
        try {
            // 1. Create Order
            const orderRes = await fetch(`${import.meta.env.VITE_API_URL}/api/subscription/create-order`, {
                method: 'POST'
            });
            const orderData = await orderRes.json();

            if (!orderRes.ok) throw new Error(orderData.error);

            // 2. Initialize Razorpay Checkout
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'dummy_key', // If empty, will rely on backend creation or test mode
                amount: orderData.amount,
                currency: "INR",
                name: "Thahoor Protein Admin",
                description: "Monthly Server Maintenance Fee",
                order_id: orderData.id,
                handler: async function (response: any) {
                    // 3. Verify Payment
                    const verifyRes = await fetch(`${import.meta.env.VITE_API_URL}/api/subscription/verify`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(response)
                    });
                    
                    const verifyData = await verifyRes.json();
                    if (verifyData.success) {
                        alert("Payment Successful! Access Granted.");
                        navigate('/admin/dashboard');
                    } else {
                        alert("Payment Verification Failed. Please contact support.");
                    }
                },
                prefill: {
                    name: "Admin User",
                    email: "admin@thahoor.com",
                    contact: "9999999999"
                },
                theme: {
                    color: "#dc2626" // Tailwind primary/red-600
                }
            };

            const rzp = new window.Razorpay(options);
            
            rzp.on('payment.failed', function (response: any){
                alert(response.error.description);
                setLoading(false);
            });
            
            rzp.open();
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Failed to initiate payment");
        } finally {
            setLoading(false);
        }
    };

    if (!statusData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden text-center"
            >
                <div className="bg-red-50 p-6 flex flex-col items-center border-b border-red-100">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                        <ShieldAlert size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Access Restricted</h2>
                    <p className="text-sm text-red-600 font-medium mt-1">Subscription Payment Required</p>
                </div>

                <div className="p-8">
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                        To access the Thahoor Protein Admin Dashboard and manage your app, please complete your monthly server maintenance fee.
                    </p>

                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 mb-8">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-500 font-medium text-sm">Billing Cycle</span>
                            <span className="text-gray-900 font-bold text-sm tracking-tight">{statusData?.cycleId?.replace(/_/g, ' ')}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-200/60">
                            <span className="text-gray-600 font-medium">Monthly Fee</span>
                            <div className="flex items-center text-xl font-bold text-gray-900">
                                <IndianRupee size={20} strokeWidth={2.5}/>
                                {statusData?.amount}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handlePayment}
                        disabled={loading}
                        className="w-full py-4 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-70"
                    >
                        {loading ? (
                            <><Loader2 size={20} className="animate-spin" /> Processing...</>
                        ) : (
                            <>Pay with Razorpay / UPI</>
                        )}
                    </button>
                    
                    <p className="text-xs text-gray-400 mt-4">Secured by Razorpay • UPI & Cards accepted</p>
                </div>
            </motion.div>
        </div>
    );
}
