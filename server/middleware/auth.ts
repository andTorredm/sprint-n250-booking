import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import logger from '../logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthRequest extends Request {
    userId?: number;
    userRole?: string;
    userEmail?: string;
    body: any;
    params: any;
}

export const authenticateToken = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        logger.warn(`Auth rejected: no token - ${req.method} ${req.url}`);
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as {
            userId: number;
            role: string;
            email: string;
        };
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        req.userEmail = decoded.email;
        next();
    } catch (error) {
        logger.warn(`Auth rejected: invalid/expired token - ${req.method} ${req.url}`);
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

export const requireAdmin = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    if (req.userRole !== 'ADMIN') {
        logger.warn(`Admin required: user #${req.userId} (${req.userRole}) tried ${req.method} ${req.url}`);
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};
