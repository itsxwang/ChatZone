import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import {ENV} from '../lib/env'; 
import User from '../models/User';

declare global {
    namespace Express {
        interface Request {
            user?: { id: string };
        }
    }
}

export const protectRoute = async (req: Request, res: Response, next: NextFunction) => {

    try {
    const token = req.cookies.jwt;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
        
    }
    const decoded = jwt.verify(token, ENV.JWT_SECRET || 'defaultsecret') as { id: string };
    if (!decoded) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    req.user = decoded;
    next();
    } catch (error) {
        console.error("err: ", error);
        res.status(500).json({ message: 'Internal server error' });
    }
}