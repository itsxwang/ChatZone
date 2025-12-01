import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.route";
import messageRoutes from "./routes/message.route";
import path from "path";
import { connectDB } from "./lib/db";
import cookieParser from "cookie-parser";
import { ENV } from "./lib/env";

const app = express();

app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(express.json({limit: "50mb"}));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

const PORT = ENV.PORT || 3001;

const rootDir = path.resolve();

if (ENV.NODE_ENV !== "development") {
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
