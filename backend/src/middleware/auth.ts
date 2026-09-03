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
    // If verifyToken was not run first in the middleware chain, verify token here
    if (!req.user) {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Unauthorized: Missing or invalid token' });
            return;
        }
        const token = authHeader.split('Bearer ')[1];
        try {
            const decodedToken = await adminAuth.verifyIdToken(token);
            req.user = decodedToken;
        } catch (error) {
            console.error('Token verification error:', error);
            res.status(401).json({ message: 'Unauthorized: Invalid token' });
            return;
        }
    }
    
    // Check custom claims (admin: true) or optional ADMIN_EMAIL env var
    const hasAdminClaim = req.user.admin === true;
    const isConfiguredAdminEmail = Boolean(process.env.ADMIN_EMAIL && req.user.email === process.env.ADMIN_EMAIL);
    
    if (hasAdminClaim || isConfiguredAdminEmail) {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: Admin privileges required' });
        return;
    }
};
