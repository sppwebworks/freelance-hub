/**
 * ============================================================
 * EXPRESS APP — Production Hardened
 * ============================================================
 *
 * Security layers:
 * 1. Helmet — security headers (XSS, clickjacking, MIME sniffing)
 * 2. CORS — whitelist allowed origins
 * 3. Rate limiting — prevent brute force / DDoS
 * 4. Mongo sanitize — prevent NoSQL injection
 * 5. Body size limit — prevent huge payloads
 *
 * ============================================================
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";

import authRoutes from "./routes/authRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import savedRoutes from "./routes/savedRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

const app = express();

// ============================================================
// 1. TRUST PROXY (for correct IP behind Render/Heroku/Netlify)
// ============================================================
app.set("trust proxy", 1);

// ============================================================
// 2. SECURITY HEADERS
// ============================================================
app.use(
  helmet({
    // Allow images/uploads to be served cross-origin
    crossOriginResourcePolicy: { policy: "cross-origin" },
    // Disable CSP in dev (Vite needs inline scripts), enable in prod
    contentSecurityPolicy:
      process.env.NODE_ENV === "production" ? undefined : false,
  }),
);

// ============================================================
// 3. CORS — whitelist client origins
// ============================================================
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, curl, mobile apps)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn(`⚠️ CORS blocked origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ============================================================
// 4. BODY PARSERS (with size limit)
// ============================================================
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// ============================================================
// 5. MONGO SANITIZE — strip $ and . from user input
// ============================================================
app.use(mongoSanitize());

// ============================================================
// 6. RATE LIMITING
// ============================================================

// Global API limiter — 300 requests per 15 min per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests from this IP. Please try again in 15 minutes.",
  },
});

// Auth limiter — 10 requests per 15 min per IP (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message:
      "Too many authentication attempts. Please try again in 15 minutes.",
  },
  skipSuccessfulRequests: true, // Only count failed attempts
});

// Upload limiter — 20 uploads per hour per IP
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many file uploads. Please try again later.",
  },
});

// Apply global limiter to all /api routes
app.use("/api", globalLimiter);

// Stricter limit on auth endpoints
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// Upload limit on application creation (contains resume)
app.use("/api/applications", (req, res, next) => {
  if (req.method === "POST") return uploadLimiter(req, res, next);
  next();
});

// ============================================================
// 7. STATIC FILES (uploads)
// ============================================================
app.use(
  "/uploads",
  express.static("uploads", {
    maxAge: "1d",
    setHeaders: (res) => {
      res.setHeader("X-Content-Type-Options", "nosniff");
    },
  }),
);

// ============================================================
// 8. HEALTH CHECK
// ============================================================
app.get("/api/health", (req, res) =>
  res.json({
    status: "ok",
    env: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  }),
);

// ============================================================
// 9. ROUTES
// ============================================================
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/saved", savedRoutes);
app.use("/api/applications", applicationRoutes);

// ============================================================
// 10. ERROR HANDLERS
// ============================================================
app.use(notFound);
app.use(errorHandler);

export default app;
