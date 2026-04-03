import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // Keeping string ID for compatibility
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String, required: true }, // Image URL or base64
}, {
    timestamps: true
});

export const Category = mongoose.model('Category', categorySchema);
