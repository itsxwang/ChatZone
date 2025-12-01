import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { ENV } from '../lib/env';
import User from '../models/User';

export interface IUser {
  _id: string;
  fullName: string;
  email: string;
  profilePic?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const protectRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ message: 'No token' });

    const decoded = jwt.verify(token, ENV.JWT_SECRET!) as { userId: string };

    const userDoc = await User.findById(decoded.userId).select('-password');
    if (!userDoc) return res.status(404).json({ message: 'User not found' });

    req.user = {
      _id: userDoc.id,
      fullName: userDoc.fullName,
      email: userDoc.email,
      profilePic: userDoc.profilePic || undefined,
    };

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};