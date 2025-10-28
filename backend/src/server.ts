import express from 'express'
// import { type Request, type Response } from 'express';
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.route'
import messageRoutes from './routes/message.route'
dotenv.config()

const app = express()
app.use(cors())
app.use(express.json()) 

app.use("/api/auth", authRoutes)
app.use("/api/message", messageRoutes)


const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Server started on port http://localhost:${PORT}`)
})