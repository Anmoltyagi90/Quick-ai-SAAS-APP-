import 'dotenv/config';
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./utils/db.js";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import aiRoutes from "./routes/aiRoutes.js";
import connectCloudinary from './utils/cloudinary.js';
import userRouter from './routes/userRoutes.js';

const app = express();
const PORT = process.env.PORT || 3030;

// Connect Cloudinary
await connectCloudinary();

// ✅ Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(clerkMiddleware());

// CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Health Check
app.get("/", (req, res) => res.send("Server is Live 🚀"));
app.get("/health", (req, res) => res.json({ status: "ok", message: "Server is running" }));

// 🔹 Debug Logging for all API requests
app.use("/api/ai", (req, res, next) => {
  console.log(`📡 API Request: ${req.method} ${req.path}`);
  console.log(`   Full URL: ${req.originalUrl}`);
  console.log(`   Headers:`, {
    authorization: req.headers.authorization ? "Present" : "Missing",
    "content-type": req.headers["content-type"],
  });
  next();
});

// 🔐 Protected AI Routes
app.use("/api/ai", requireAuth(), aiRoutes); 
app.use("/api/user", requireAuth(), userRouter);

// Start Server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
  } catch (error) {
    console.error("❌ Server start failed:", error.message);
  }
};

startServer();
