import jwt from 'jsonwebtoken';
import { type Response } from 'express'

export const generateToken = (id: string, res: Response) => {
    const token = jwt.sign({ id }, process.env.JWT_SECRET!, {
        expiresIn: '7d',
    });

    //  httpOnly cookie for security, only read by the server and browser, can't access it via JavaScript
    res.cookie('jwt', token, {
        httpOnly: true, // XSS prevention 
        secure: process.env.NODE_ENV === 'development' ? false : true, // HTTPS in production
        sameSite: 'strict', // CSRF, means cookie only sent for same site requests
        maxAge: 7 * 24 * 60 * 60 * 1000, // MS, 7 days
    });

    return token;
};