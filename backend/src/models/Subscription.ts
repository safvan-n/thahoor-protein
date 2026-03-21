import mongoose from 'mongoose';

export interface ISubscription extends mongoose.Document {
    cycleId: string; // e.g., '2026-03-19_to_2026-04-19'
    amount: number;
    paymentStatus: 'Pending' | 'Completed' | 'Failed';
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    paidAt?: Date;
}

const subscriptionSchema = new mongoose.Schema({
    cycleId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    paidAt: { type: Date }
}, { timestamps: true });

export default mongoose.model<ISubscription>('Subscription', subscriptionSchema);
