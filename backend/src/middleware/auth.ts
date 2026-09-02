import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin';

export interface AuthRequest extends Request {
    user?: any;
}

export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Unauthorized: Missing or invalid token' });
        return;
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ message: 'Unauthorized: Invalid token' });
        return;
    }
};

export const verifyAdmin = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    
    // For robust security without a custom claim setup, check the email
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@thahoorprotein.com';
    
    if (req.user.admin === true || req.user.email === adminEmail) {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: Admin access required' });
        return;
    }
};
