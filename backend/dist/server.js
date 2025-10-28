"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// import { type Request, type Response } from 'express';
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const message_route_1 = __importDefault(require("./routes/message.route"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const rootDir = path_1.default.resolve();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api/auth", auth_route_1.default);
app.use("/api/message", message_route_1.default);
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV === "production") {
    app.use(express_1.default.static(path_1.default.join(rootDir, "../frontend/dist")));
    // Serve index.html for any unmatched route (allow SPA routing). Using app.use to avoid
    // path parsing issues with path-to-regexp when using wildcard route strings.
    app.get("/", (req, res) => {
        res.sendFile(path_1.default.resolve(rootDir, "../frontend", "dist", "index.html"));
    });
}
app.listen(PORT, () => {
    console.log(`Server started on port http://localhost:${PORT}`);
});
