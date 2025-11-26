import express from 'express'
// import { type Request, type Response } from 'express';
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.route'
import messageRoutes from './routes/message.route'
import path from 'path'
import { connectDB } from './lib/db'


dotenv.config()

const app = express()


app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/message", messageRoutes)


const PORT = process.env.PORT || 3000


const rootDir = path.resolve()

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(rootDir, "../frontend/dist")))

    // Serve index.html for any unmatched route (allow SPA routing).
    app.get("/", (_, res) => {
        res.sendFile(path.resolve(rootDir, "../frontend", "dist", "index.html"))
    })
}


// Vercel serverless: connect DB at cold start
let dbReady = false;
async function ensureDB() {
    if (!dbReady) {
        try {
            await connectDB();
            dbReady = true;
        } catch (error) {
            console.error('MongoDB connection error:', error);
        }
    }
}

// Vercel serverless export
import { Request, Response } from 'express';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: Request | VercelRequest, res: Response | VercelResponse) {
    await ensureDB();
    app(req as any, res as any);
}
