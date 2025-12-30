import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { globalError } from "./middlewares/errorMiddleware.js";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import branchRoutes from "./routes/branch.routes.js";
import trackRoutes from "./routes/track.routes.js";
import branchTrackRoutes from "./routes/branch-track.routes.js";
import courseRoutes from "./routes/course.routes.js";
import instructorCourseRoutes from "./routes/instructor-course.routes.js";
import studentRoutes from "./routes/student.routes.js";
import questionRoutes from "./routes/question.routes.js";
import examRoutes from "./routes/exam.routes.js";
import { getPool } from "./config/db.js";

dotenv.config();

// Initialize Express app
const app = express();

// Trust proxy - required when behind a reverse proxy (e.g., Render, Heroku, nginx)
// This allows express-rate-limit to correctly identify users by their real IP
app.set("trust proxy", 1);

app.use(helmet());
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: {
    success: false,
    message: "Too many login attempts, please try again later.",
  },
  skipSuccessfulRequests: true,
});

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// // Health check route
// app.get("/health", async (req, res) => {
//   try {
//     await getPool();
//     res.status(200).json({
//       success: true,
//       message: "Server is running",
//       timestamp: new Date().toISOString(),
//       database: "connected",
//     });
//   } catch (error) {
//     res.status(503).json({
//       success: false,
//       message: "Service unavailable",
//       timestamp: new Date().toISOString(),
//       database: "disconnected",
//     });
//   }
// });

// API routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/tracks", trackRoutes);
app.use("/api/branch-tracks", branchTrackRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/instructor-course", instructorCourseRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/exams", examRoutes);

// Handle undefined routes
app.all("*", (req, res, next) => {
  next(new ApiError(`Can't find ${req.originalUrl} on this server!`, 400));
});

// Global error handler
app.use(globalError);

export default app;
