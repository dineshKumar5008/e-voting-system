import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import csrf from "csurf";

import { applySecurityMiddlewares } from "./middleware/securityHeaders.js";
import { authLimiter, votingLimiter } from "./middleware/rateLimiter.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import voteRoutes from "./routes/voteRoutes.js";
import blockchainRoutes from "./routes/blockchainRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { env } from "./config/env.js";

const app = express();

// CORS configuration – tighten origins in production
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);

// Logging
if (env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Body parsing
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Security middlewares
applySecurityMiddlewares(app);

// CSRF protection for cookie-based flows – SPA sends X-CSRF-Token
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    sameSite: "strict",
    secure: env.NODE_ENV === "production",
  },
});

// CSRF token route for frontend to retrieve token
app.get("/api/csrf-token", csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Apply CSRF to state-changing routes only
app.use("/api", csrfProtection);

// Rate limiting
app.use("/api/auth", authLimiter);
app.use("/api/vote", votingLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/vote", voteRoutes);
app.use("/api/blockchain", blockchainRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Error handlers
app.use(notFound);
app.use(errorHandler);

export default app;


