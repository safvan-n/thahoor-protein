/// <reference types="vite/client" />
import { useEffect, useState, useRef, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductStore } from '../../store/productStore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useCategoryStore } from '../../store/categoryStore';
import { 
    Trash2, 
    Edit, 
    Save, 
    X, 
    Upload, 
    LogOut, 
    CheckCircle2, 
    TrendingUp, 
    User,
    LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Cut, type Category } from '../../types';
import { db } from '../../lib/firebase';
import { ImageUploader } from '../../components/admin/ImageUploader';
import { uploadImageToStorage } from '../../utils/uploadImage';
import { 
    collection, 
    onSnapshot, 
    query, 
    orderBy, 
    doc, 
    updateDoc, 
    deleteDoc,
    limit 
} from 'firebase/firestore';

export function AdminDashboard() {
    const navigate = useNavigate();
    const { products, updateProduct, addProduct, deleteProduct, fetchProducts } = useProductStore();
    const { categories, addCategory, updateCategory, deleteCategory, fetchCategories } = useCategoryStore();
    
    const [editingProduct, setEditingProduct] = useState<Cut | null>(null);
    const [isAddingProduct, setIsAddingProduct] = useState(false);

    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [assigningOrder, setAssigningOrder] = useState<any>(null);
    const [driverEmail, setDriverEmail] = useState('');
    const [driverName, setDriverName] = useState('');
    const [availableDrivers, setAvailableDrivers] = useState<any[]>([]);

    useEffect(() => {
        const driversCol = collection(db, 'drivers');
        const q = query(driversCol, orderBy('name', 'asc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAvailableDrivers(list);
        });

        return () => unsubscribe();
    }, []);

    // Form states for adding category
    const [catName, setCatName] = useState('');
    const [catDesc, setCatDesc] = useState('');
    const [catImage, setCatImage] = useState('');
    const [catImageFile, setCatImageFile] = useState<File | null>(null);

    // Form states for editing
    const [editPrice, setEditPrice] = useState<number>(0);
    const [editImage, setEditImage] = useState<string>('');
    const [editImageFile, setEditImageFile] = useState<File | null>(null);
    const [editSecondaryImage, setEditSecondaryImage] = useState<string>('');
    const [editSecondaryImageFile, setEditSecondaryImageFile] = useState<File | null>(null);

    // Form states for editing category
    const [editCatName, setEditCatName] = useState('');
    const [editCatDesc, setEditCatDesc] = useState('');
    const [editCatImage, setEditCatImage] = useState('');
    const [editCatImageFile, setEditCatImageFile] = useState<File | null>(null);

    // Form states for adding product
    const [newName, setNewName] = useState('');
    const [newPrice, setNewPrice] = useState<number>(0);
    const [newCategory, setNewCategory] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newImage, setNewImage] = useState('');
    const [newImageFile, setNewImageFile] = useState<File | null>(null);
    const [newSecondaryImage, setNewSecondaryImage] = useState('');
    const [newSecondaryImageFile, setNewSecondaryImageFile] = useState<File | null>(null);

    const [isUploadingImage, setIsUploadingImage] = useState(false);

    const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'categories'>('products');
    const [orders, setOrders] = useState<any[]>([]);

    // Notification Sound
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const isInitialLoad = useRef(true);

    useEffect(() => {
        // Initialize Audio
        audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audioRef.current.volume = 1.0;

        // Firestore Real-time listener for ALL orders (Admin view)
        const ordersCol = collection(db, 'orders');
        const q = query(ordersCol, orderBy('createdAt', 'desc'), limit(50));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const orderList = snapshot.docs.map(d => ({
                _id: d.id,
                ...d.data()
            })) as any[];

            if (isInitialLoad.current) {
                setOrders(orderList);
                isInitialLoad.current = false;
                return;
            }

            // Play sound for NEW orders only
            let hasNewOrder = false;
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    hasNewOrder = true;
                }
            });

            if (hasNewOrder) {
                audioRef.current?.play().catch((e: any) => console.log('Audio play failed:', e));
            }

            setOrders(orderList);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    useEffect(() => {
        const checkAdmin = async () => {
            const user = auth.currentUser;
            if (!user) {
                navigate('/admin');
                return;
            }
            
            try {
                // Force token refresh to ensure we have the latest claims
                const tokenResult = await user.getIdTokenResult(true);
                
                // Also check environment variable for local testing fallback (optional but keeping for safety during dev)
                const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
                
                if (tokenResult.claims.admin !== true && user.email !== adminEmail) {
                    navigate('/admin');
                }
            } catch (error) {
                console.error("Error checking admin claims", error);
                navigate('/admin');
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                navigate('/admin');
            } else {
                checkAdmin();
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const handleLogout = async () => {
        await auth.signOut();
        navigate('/admin');
    };

    useEffect(() => {
        if (activeTab === 'products' || activeTab === 'categories') {
            fetchCategories();
            fetchProducts();
        }
    }, [activeTab, fetchCategories, fetchProducts]);

    useEffect(() => {
        if (categories.length > 0 && !newCategory) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setNewCategory(categories[0].id);
        }
    }, [categories, newCategory]);



    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        try {
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, {
                status: newStatus,
                updatedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error('Failed to update status in Firestore:', error);
        }
    };

    const handleDeleteOrder = async (orderId: string) => {
        if (!window.confirm("Are you sure you want to delete this order?")) return;

        try {
            const orderRef = doc(db, 'orders', orderId);
            await deleteDoc(orderRef);
        } catch (error) {
            console.error('Failed to delete order from Firestore:', error);
        }
    };

    const handleAssignDriver = async () => {
        if (!assigningOrder || !driverEmail) {
            alert('Please select a driver or enter valid details');
            return;
        }

        // Final Security Check: Ensure driver is ONLINE if they are in our fleet
        const fleetMember = availableDrivers.find(d => d.email === driverEmail.trim().toLowerCase());
        if (fleetMember && fleetMember.status !== 'online') {
            alert(`⛔ Assignment Blocked: ${fleetMember.name} is currently OFF-DUTY. Please wait for them to go online or pick another pilot.`);
            return;
        }

        try {
            const orderId = assigningOrder.id || assigningOrder._id;
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, {
                assignedTo: driverEmail.trim().toLowerCase(),
                driverName: driverName.trim(),
                status: 'Confirmed',
                updatedAt: new Date().toISOString()
            });
            
            setAssigningOrder(null);
            setDriverName('');
            setDriverEmail('');
        } catch (err) {
            console.error('Failed to assign driver:', err);
            alert('Assignment failed');
        }
    };

    const handleWhatsAppDelivery = (order: any) => {
        const address = `${order.customer.address?.street}, ${order.customer.address?.city} - ${order.customer.address?.pincode} ${order.customer.address?.landmark ? '(' + order.customer.address.landmark + ')' : ''}`;
        const locationLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

        const text = `*New Delivery Assignment 🚛*%0A%0AOrder #${order.orderId || order._id.slice(-6)}%0ACustomer: *${order.customer.name}*%0APhone: ${order.customer.phone}%0A%0A*Address:*%0A${address}%0A%0A*Google Maps:*%0A${locationLink}%0A%0A*Items:*%0A${order.items.map((i: any) => `- ${i.name} (x${i.qty}kg)`).join('%0A')}%0A%0ATotal to Collect: *₹${order.totalAmount}*%0A%0A*Assigned to:* ${order.driverName || 'Pending'}%0A%0APlease confirm pickup.`;
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    const saveProduct = async () => {
        if (editingProduct) {
            setIsUploadingImage(true);
            try {
                let imageUrl = editImage;
                if (editImageFile) {
                    imageUrl = await uploadImageToStorage(editImageFile, 'products', editingProduct.id);
                }
                
                let secondaryImageUrl = editSecondaryImage;
                if (editSecondaryImageFile) {
                    secondaryImageUrl = await uploadImageToStorage(editSecondaryImageFile, 'products', `${editingProduct.id}_secondary`);
                }
                
                await updateProduct(editingProduct.id, {
                    pricePerKg: editPrice,
                    image: imageUrl,
                    secondaryImage: secondaryImageUrl
                });
                setEditingProduct(null);
                setEditImageFile(null);
                setEditSecondaryImageFile(null);
            } catch (error) {
                alert("Failed to update product");
            } finally {
                setIsUploadingImage(false);
            }
        }
    };


    const handleAddProduct = async () => {
        if (!newName || !newPrice || (!newImage && !newImageFile)) {
            alert("Please fill all fields and select an image");
            return;
        }

        setIsUploadingImage(true);
        try {
            const productId = Date.now().toString();
            let imageUrl = newImage;
            
            if (newImageFile) {
                imageUrl = await uploadImageToStorage(newImageFile, 'products', productId);
            }

            let secondaryImageUrl = newSecondaryImage;
            if (newSecondaryImageFile) {
                secondaryImageUrl = await uploadImageToStorage(newSecondaryImageFile, 'products', `${productId}_secondary`);
            }

            await addProduct({
                id: productId,
                name: newName,
                pricePerKg: newPrice,
                categoryId: newCategory,
                description: newDescription,
                image: imageUrl,
                secondaryImage: secondaryImageUrl
            });

            setIsAddingProduct(false);
            // Reset form
            setNewName('');
            setNewPrice(0);
            setNewDescription('');
            setNewImage('');
            setNewImageFile(null);
            setNewSecondaryImage('');
            setNewSecondaryImageFile(null);
        } catch (error) {
            alert("Failed to add product");
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleDeleteProduct = (id: string) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            deleteProduct(id);
        }
    };

    const handleAddCategory = async () => {
        if (!catName || (!catImage && !catImageFile)) {
            alert("Please fill name and image");
            return;
        }

        setIsUploadingImage(true);
        try {
            const categoryId = Date.now().toString();
            let imageUrl = catImage;
            
            if (catImageFile) {
                imageUrl = await uploadImageToStorage(catImageFile, 'categories', categoryId);
            }

            await addCategory({
                id: categoryId,
                name: catName,
                description: catDesc,
                image: imageUrl
            });

            setIsAddingCategory(false);
            setCatName('');
            setCatDesc('');
            setCatImage('');
            setCatImageFile(null);
        } catch(error) {
            alert("Failed to add category");
        } finally {
            setIsUploadingImage(false);
        }
    };

    const saveCategory = async () => {
        if (editingCategory) {
            setIsUploadingImage(true);
            try {
                let imageUrl = editCatImage;
                if (editCatImageFile) {
                    imageUrl = await uploadImageToStorage(editCatImageFile, 'categories', editingCategory.id);
                }
                await updateCategory(editingCategory.id, {
                    name: editCatName,
                    description: editCatDesc,
                    image: imageUrl
                });
                setEditingCategory(null);
                setEditCatImageFile(null);
            } catch(error) {
                alert("Failed to update category");
            } finally {
                setIsUploadingImage(false);
            }
        }
    };

    const handleDeleteCategory = (id: string) => {
        if (window.confirm("Are you sure you want to delete this category? This might affect products using it.")) {
            deleteCategory(id);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
                <div className="mb-8 flex items-center gap-3 text-primary font-bold text-xl">
                    <span>Admin Panel</span>
                </div>

                <nav className="flex-1 space-y-2">
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'products' ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Edit size={20} /> Products
                    </button>
                    <button
                        onClick={() => setActiveTab('categories')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'categories' ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <LayoutGrid size={20} /> Categories
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'orders' ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Save size={20} /> Orders
                    </button>
                </nav>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-500 transition-colors mt-auto"
                >
                    <LogOut size={20} /> Logout
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8 overflow-y-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">
                        {activeTab === 'products' ? 'Product Management' : 
                         activeTab === 'categories' ? 'Category Management' : 'Order Management'}
                    </h1>
                    <div className="flex gap-4">
                        {activeTab === 'products' ? (
                            <button
                                onClick={() => setIsAddingProduct(true)}
                                className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-red-800 transition-colors"
                            >
                                + Add Product
                            </button>
                        ) : activeTab === 'categories' ? (
                            <button
                                onClick={() => setIsAddingCategory(true)}
                                className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-red-800 transition-colors"
                            >
                                + Add Category
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        audioRef.current?.play().catch((e: any) => alert('Allow sound: ' + e));
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-lg text-xs font-bold border border-yellow-100 hover:bg-yellow-100 transition-colors"
                                    title="Test notification sound"
                                >
                                    🔔 Test Sound
                                </button>
                                <button
                                    onClick={async () => {
                                        const user = auth.currentUser;
                                        if (!user) return;
                                        const token = await user.getIdToken();
                                        fetch(`${import.meta.env.VITE_API_URL}/api/orders/admin`, {
                                            headers: {
                                                'Authorization': `Bearer ${token}`
                                            }
                                        })
                                            .then(res => res.json())
                                            .then(data => setOrders(data));
                                    }}
                                    className="text-primary hover:bg-red-50 px-3 py-1 rounded-lg text-sm font-bold transition-colors"
                                >
                                    Refresh List
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {activeTab === 'products' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product) => (
                            // ... Product card remains similar
                            <motion.div
                                layout
                                key={product.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                            >
                                <div className="relative h-48 bg-gray-100">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-3 right-3 flex gap-2">
                                        <button
                                            onClick={() => {
                                                setEditingProduct(product);
                                                setEditPrice(product.pricePerKg);
                                                setEditImage(product.image);
                                                setEditSecondaryImage(product.secondaryImage || '');
                                            }}
                                            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white text-gray-700 shadow-sm transition-all"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteProduct(product.id)}
                                            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-red-50 text-red-500 shadow-sm transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-lg">{product.name}</h3>
                                            <p className="text-gray-500 text-sm">
                                                Category: {categories.find(c => c.id === product.categoryId)?.name || product.categoryId}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Daily Rate</p>
                                            <p className="font-bold text-xl text-primary">₹{product.pricePerKg}<span className="text-sm font-normal text-gray-400">/kg</span></p>
                                        </div>
                                    </div>
                                    
                                    {/* Availability Buttons */}
                                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                                        <button
                                            onClick={() => updateProduct(product.id, { isAvailable: true })}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${product.isAvailable ? 'bg-green-500 text-white shadow-sm' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                        >
                                            Available
                                        </button>
                                        <button
                                            onClick={() => updateProduct(product.id, { isAvailable: false })}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${!product.isAvailable ? 'bg-red-500 text-white shadow-sm' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                        >
                                            Unavailable
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : activeTab === 'categories' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map((cat) => (
                            <motion.div
                                layout
                                key={cat.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                            >
                                <div className="relative h-40 bg-gray-100">
                                    <img
                                        src={cat.image}
                                        alt={cat.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-3 right-3 flex gap-2">
                                        <button
                                            onClick={() => {
                                                setEditingCategory(cat);
                                                setEditCatName(cat.name);
                                                setEditCatDesc(cat.description || '');
                                                setEditCatImage(cat.image);
                                            }}
                                            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white text-gray-700 shadow-sm transition-all"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCategory(cat.id)}
                                            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-red-50 text-red-500 shadow-sm transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-gray-800 text-lg">{cat.name}</h3>
                                    <p className="text-gray-500 text-sm line-clamp-1">{cat.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    // Orders List
                    <div className="space-y-4">
                        {orders.map(order => (
                            <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative group">
                                <button
                                    onClick={() => handleDeleteOrder(order._id)}
                                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    title="Delete Order"
                                >
                                    <Trash2 size={18} />
                                </button>

                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg">Order #{order.orderId || order._id.slice(-6)}</h3>
                                        <div className="text-sm text-gray-600 mt-1">
                                            <p><span className="font-medium text-gray-800">{order.customer.name}</span> ({order.customer.phone})</p>
                                            <p className="text-xs text-gray-500 max-w-xs mt-0.5">
                                                {order.customer.address?.street}, {order.customer.address?.city} - {order.customer.address?.pincode}
                                                {order.customer.address?.landmark && <span className="block italic">Landmark: {order.customer.address.landmark}</span>}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mr-10">
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                                            className="px-3 py-1 rounded-full text-sm font-bold border border-gray-200 bg-gray-50 outline-none"
                                        >
                                            <option value="Placed">Placed</option>
                                            <option value="Confirmed">Confirmed</option>
                                            <option value="On the Way">On the Way</option>
                                            <option value="Delivered">Delivered</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-between items-end mt-4">
                                    <div>
                                        <p className="text-sm font-bold text-gray-700">Items:</p>
                                        <ul className="text-sm text-gray-600">
                                            {order.items.map((i: any, idx: number) => (
                                                <li key={idx}>{i.name} x {i.qty}kg</li>
                                            ))}
                                        </ul>

                                        {/* Payment Info */}
                                         <div className="mt-3">
                                            <p className="text-sm font-bold text-gray-700">Payment: <span className="font-normal">{order.paymentMethod}</span></p>
                                            {order.paymentMethod === 'Online' && order.paymentProof && (
                                                <a
                                                    href={order.paymentProof}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-block mt-1 text-xs font-bold text-blue-600 hover:text-blue-800 underline"
                                                >
                                                    View Payment Proof
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right space-y-2">
                                        <p className="font-bold text-xl mb-1">₹{order.totalAmount}</p>
                                        
                                        {order.driverName ? (
                                            <div className="flex flex-col items-end">
                                                <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-blue-100">
                                                    <User size={14} />
                                                    Assigned: {order.driverName}
                                                </div>
                                                <button
                                                    onClick={() => setAssigningOrder(order)}
                                                    className="text-[10px] text-gray-400 font-bold hover:text-primary mt-1 underline"
                                                >
                                                    Change Driver
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setAssigningOrder(order)}
                                                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center justify-center gap-2 transition-all shadow-sm shadow-blue-600/20"
                                            >
                                                <User size={16} />
                                                Assign Driver
                                            </button>
                                        )}

                                        <button
                                            onClick={() => handleWhatsAppDelivery(order)}
                                            className="w-full bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 flex items-center justify-center gap-2 transition-all shadow-sm shadow-green-600/20"
                                        >
                                            <TrendingUp size={16} />
                                            WhatsApp Fleet
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {editingProduct && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
                        onClick={() => setEditingProduct(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Edit Product</h3>
                                <button onClick={() => setEditingProduct(null)} className="text-gray-400 hover:text-gray-600">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                    <input
                                        type="text"
                                        value={editingProduct.name}
                                        disabled
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price per Kg (₹)</label>
                                    <input
                                        type="number"
                                        value={editPrice}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setEditPrice(Number(e.target.value))}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                                    <ImageUploader
                                        currentImage={editImage}
                                        onFileSelect={setEditImageFile}
                                        isUploading={isUploadingImage}
                                    />
                                    
                                    <div className="mt-3">
                                        <p className="text-xs text-center text-gray-500">
                                            OR paste an image URL below
                                        </p>
                                        <input
                                            type="text"
                                            value={editImage}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                                setEditImage(e.target.value);
                                                setEditImageFile(null);
                                            }}
                                            placeholder="https://example.com/image.jpg"
                                            className="w-full mt-2 px-3 py-2 text-sm rounded-md border border-gray-200 focus:ring-1 focus:ring-primary focus:border-transparent outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Image (Optional)</label>
                                    <ImageUploader
                                        currentImage={editSecondaryImage}
                                        onFileSelect={setEditSecondaryImageFile}
                                        isUploading={isUploadingImage}
                                    />
                                    
                                    <div className="mt-3">
                                        <p className="text-xs text-center text-gray-500">
                                            OR paste an image URL below
                                        </p>
                                        <input
                                            type="text"
                                            value={editSecondaryImage}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                                setEditSecondaryImage(e.target.value);
                                                setEditSecondaryImageFile(null);
                                            }}
                                            placeholder="https://example.com/secondary.jpg"
                                            className="w-full mt-2 px-3 py-2 text-sm rounded-md border border-gray-200 focus:ring-1 focus:ring-primary focus:border-transparent outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3 justify-end">
                                <button
                                    onClick={() => setEditingProduct(null)}
                                    className="px-6 py-2.5 rounded-lg border border-gray-300 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveProduct}
                                    className="px-6 py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-red-800 transition-colors flex items-center gap-2"
                                >
                                    <Save size={18} />
                                    Save Changes
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Add Product Modal */}
            <AnimatePresence>
                {isAddingProduct && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
                        onClick={() => setIsAddingProduct(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Add New Product</h3>
                                <button onClick={() => setIsAddingProduct(false)} className="text-gray-400 hover:text-gray-600">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setNewName(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                        placeholder="e.g. Chicken Lollipops"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        value={newCategory}
                                        onChange={(e: ChangeEvent<HTMLSelectElement>) => setNewCategory(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price per Kg (₹)</label>
                                    <input
                                        type="number"
                                        value={newPrice}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPrice(Number(e.target.value))}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={newDescription}
                                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewDescription(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                                    <ImageUploader
                                        currentImage={newImage}
                                        onFileSelect={setNewImageFile}
                                        isUploading={isUploadingImage}
                                    />
                                    
                                    <div className="mt-3">
                                        <p className="text-xs text-center text-gray-500">
                                            OR paste an image URL below
                                        </p>
                                        <input
                                            type="text"
                                            value={newImage}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                                setNewImage(e.target.value);
                                                setNewImageFile(null);
                                            }}
                                            placeholder="https://example.com/image.jpg"
                                            className="w-full mt-2 px-3 py-2 text-sm rounded-md border border-gray-200 focus:ring-1 focus:ring-primary focus:border-transparent outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Image (Optional)</label>
                                    <ImageUploader
                                        currentImage={newSecondaryImage}
                                        onFileSelect={setNewSecondaryImageFile}
                                        isUploading={isUploadingImage}
                                    />
                                    
                                    <div className="mt-3">
                                        <p className="text-xs text-center text-gray-500">
                                            OR paste an image URL below
                                        </p>
                                        <input
                                            type="text"
                                            value={newSecondaryImage}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                                setNewSecondaryImage(e.target.value);
                                                setNewSecondaryImageFile(null);
                                            }}
                                            placeholder="https://example.com/secondary.jpg"
                                            className="w-full mt-2 px-3 py-2 text-sm rounded-md border border-gray-200 focus:ring-1 focus:ring-primary focus:border-transparent outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3 justify-end">
                                <button
                                    onClick={() => setIsAddingProduct(false)}
                                    className="px-6 py-2.5 rounded-lg border border-gray-300 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddProduct}
                                    className="px-6 py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-red-800 transition-colors flex items-center gap-2"
                                >
                                    <Save size={18} />
                                    Add Product
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Category Modal */}
            <AnimatePresence>
                {isAddingCategory && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
                        onClick={() => setIsAddingCategory(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Add New Category</h3>
                                <button onClick={() => setIsAddingCategory(false)} className="text-gray-400 hover:text-gray-600">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                                    <input
                                        type="text"
                                        value={catName}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setCatName(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                        placeholder="e.g. Exotic Meats"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={catDesc}
                                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setCatDesc(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                        rows={2}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category Image</label>
                                    <ImageUploader
                                        currentImage={catImage}
                                        onFileSelect={setCatImageFile}
                                        isUploading={isUploadingImage}
                                    />
                                    
                                    <div className="mt-3">
                                        <p className="text-xs text-center text-gray-500">OR paste URL</p>
                                        <input
                                            type="text"
                                            value={catImage}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                                setCatImage(e.target.value);
                                                setCatImageFile(null);
                                            }}
                                            placeholder="https://example.com/cat.jpg"
                                            className="w-full mt-1 px-3 py-2 text-sm rounded-md border border-gray-200"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3 justify-end">
                                <button
                                    onClick={() => setIsAddingCategory(false)}
                                    className="px-6 py-2.5 rounded-lg border border-gray-300 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddCategory}
                                    className="px-6 py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-red-800 transition-colors flex items-center gap-2"
                                >
                                    <Save size={18} />
                                    Add Category
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Category Modal */}
            <AnimatePresence>
                {editingCategory && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
                        onClick={() => setEditingCategory(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Edit Category</h3>
                                <button onClick={() => setEditingCategory(null)} className="text-gray-400 hover:text-gray-600">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                                    <input
                                        type="text"
                                        value={editCatName}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setEditCatName(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={editCatDesc}
                                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setEditCatDesc(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                        rows={2}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category Image</label>
                                    <ImageUploader
                                        currentImage={editCatImage}
                                        onFileSelect={setEditCatImageFile}
                                        isUploading={isUploadingImage}
                                    />
                                    
                                    <div className="mt-3">
                                        <p className="text-xs text-center text-gray-500">OR paste URL</p>
                                        <input
                                            type="text"
                                            value={editCatImage}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                                setEditCatImage(e.target.value);
                                                setEditCatImageFile(null);
                                            }}
                                            className="w-full mt-1 px-3 py-2 text-sm rounded-md border border-gray-200"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3 justify-end">
                                <button
                                    onClick={() => setEditingCategory(null)}
                                    className="px-6 py-2.5 rounded-lg border border-gray-300 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveCategory}
                                    className="px-6 py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-red-800 transition-colors flex items-center gap-2"
                                >
                                    <Save size={18} />
                                    Save Changes
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Assign Driver Modal */}
            <AnimatePresence>
                {assigningOrder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center px-4"
                        onClick={() => setAssigningOrder(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl relative overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
                            
                            <div className="flex justify-between items-center mb-8 relative">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
                                        <User size={20} />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Assign Fleet</h3>
                                </div>
                                <button onClick={() => setAssigningOrder(null)} className="text-gray-400 hover:text-gray-600 p-2">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-6 relative">
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-2">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Assigning Order</p>
                                    <p className="font-bold text-gray-800">#{assigningOrder.orderId || assigningOrder._id.slice(-6)}</p>
                                </div>

                                <div className="space-y-3 pb-2 border-b border-gray-50">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2 mb-2">Select Active Fleet</label>
                                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                        {availableDrivers.filter(d => d.status === 'online').length === 0 ? (
                                            <p className="text-xs text-gray-400 italic p-6 text-center bg-gray-50 rounded-3xl">No fleet members are currently online</p>
                                        ) : (
                                            availableDrivers.filter(d => d.status === 'online').map(driver => (
                                                <button
                                                    key={driver.id}
                                                    onClick={() => {
                                                        setDriverName(driver.name);
                                                        setDriverEmail(driver.email);
                                                    }}
                                                    className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                                                        driverEmail === driver.email 
                                                        ? 'border-blue-500 bg-blue-50' 
                                                        : 'border-gray-50 hover:border-gray-200 bg-white'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                                        <div className="text-left">
                                                            <p className="text-sm font-bold text-gray-800">{driver.name}</p>
                                                            <p className="text-[10px] text-gray-500 font-medium">{driver.email}</p>
                                                        </div>
                                                    </div>
                                                    {driverEmail === driver.email && <CheckCircle2 size={16} className="text-blue-500" />}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2 mb-3">Or Add Custom Details</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            value={driverName}
                                            onChange={(e) => setDriverName(e.target.value)}
                                            placeholder="Driver Name"
                                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-blue-500 outline-none transition-all font-bold text-xs"
                                        />
                                        <input
                                            type="email"
                                            value={driverEmail}
                                            onChange={(e) => setDriverEmail(e.target.value)}
                                            placeholder="Driver Email"
                                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-blue-500 outline-none transition-all font-bold text-xs"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleAssignDriver}
                                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                    Confirm Assignment
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
