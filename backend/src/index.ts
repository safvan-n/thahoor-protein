import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import http from 'http';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Socket.io Setup
export const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for now (adjust for production)
        methods: ["GET", "POST", "PATCH"]
    }
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import subscriptionRoutes from './routes/subscriptionRoutes';

app.use(cors());
app.use(express.json());

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/subscription', subscriptionRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/thahoor')
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => {
        console.log('⚠️  MongoDB not found. Running in Offline Mode (File-based storage active).');
        // console.error('❌ MongoDB Connection Error:', err); // Suppress annoying error
    });

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Thahoor Protein API is active' });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
