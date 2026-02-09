import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // Keeping string ID to match frontend for now
    name: { type: String, required: true },
    description: { type: String, required: true },
    pricePerKg: { type: Number, required: true },
    categoryId: { type: String, required: true },
    image: { type: String, required: true }, // URL or Base64
    isAvailable: { type: Boolean, default: true }
}, {
    timestamps: true
});

export const Product = mongoose.model('Product', productSchema);
