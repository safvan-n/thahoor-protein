import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    qty: { type: Number, required: true }, // Quantity in Kg
    price: { type: Number, required: true }  // Price per Kg at time of order
});

const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    customer: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        address: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            pincode: { type: String, required: true },
            landmark: { type: String }
        },
        location: {
            lat: { type: Number },
            lng: { type: Number }
        }
    },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['Placed', 'Confirmed', 'On the Way', 'Delivered', 'Cancelled'],
        default: 'Placed'
    },
    paymentMethod: {
        type: String,
        enum: ['COD', 'Online'],
        required: true
    },
    paymentProof: { type: String }, // Base64 string for online payment screenshot
    isArchived: { type: Boolean, default: false }, // Soft delete for admin
    isDeletedByUser: { type: Boolean, default: false }, // Soft delete for user
    deliveryBoy: {
        name: { type: String },
        phone: { type: String }
    }
}, {
    timestamps: true
});

export const Order = mongoose.model('Order', orderSchema);
