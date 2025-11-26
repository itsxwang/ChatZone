import express from "express";
// import { type Request, type Response } from 'express';
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route";
import messageRoutes from "./routes/message.route";
import path from "path";
import { connectDB } from "./lib/db";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

const PORT = process.env.PORT || 3000;

const rootDir = path.resolve();

if (process.env.NODE_ENV === "production") {

    app.use(express.static(path.join(rootDir, "../frontend/dist")));

    // Catch-all for frontend routes (SPA)
    app.get(/.*/, (_, res) => {
        res.sendFile(path.resolve(rootDir, "../frontend/dist/index.html"));
    });
}


connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server started on port http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1); // 1 status code means failure, 0 for success
  });
