import app from "./src/app.js";
import { getPool, closePool } from "./src/config/db.js";
import dotenv from "dotenv";
import { gracefulShutdown } from "./src/middlewares/errorMiddleware.js";
dotenv.config();

const PORT = process.env.PORT || 5000;
let server;

/**
 * Start server
 */
const startServer = async () => {
  try {
    server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
    await getPool();
  } catch (err) {
    await gracefulShutdown("STARTUP_ERROR", err);
  }
};

/**
 * Process-level error handling
 */
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

process.on("unhandledRejection", (err) => {
  gracefulShutdown("UNHANDLED_REJECTION", err);
});

process.on("uncaughtException", (err) => {
  gracefulShutdown("UNCAUGHT_EXCEPTION", err);
});

/**
 * Boot application
 */
startServer();
