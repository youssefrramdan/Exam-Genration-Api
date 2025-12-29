import ApiError from "../utils/apiError.js";

const handleJwtInvalidSignature = () =>
  new ApiError(401, "Invalid token, please login again", false);

const handleJwtExpired = () =>
  new ApiError(401, "Token expired, please login again", false);

const handleDuplicateFieldsDB = (err) => {
  const value = Object.values(err.keyValue)[0];
  return new ApiError(400, `Duplicate field value: ${value}`, false, err);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((e) => e.message);
  return new ApiError(
    400,
    `Invalid input data: ${errors.join(", ")}`,
    false,
    err
  );
};

const sendErrorForDev = (err, res) => {
  res.status(err.statusCode).json({
    success: err.success,
    status: err.status,
    message: err.message,
    error: err.error,
    stack: err.stack,
  });
};
const sendErrorForProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: err.success,
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming or unknown error
    res.status(500).json({
      success: false,
      status: "error",
      message: "Something went wrong",
    });
  }
};

/**
 * Graceful shutdown handler
 */
const gracefulShutdown = async (signal, error = null) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  if (error) {
    console.error("Shutdown error:", error);
  }

  try {
    if (server) {
      server.close(async () => {
        console.log("HTTP server closed");

        try {
          await closePool();
          console.log("Database connection closed");
          process.exit(0);
        } catch (dbErr) {
          console.error("Error closing database:", dbErr);
          process.exit(1);
        }
      });
      setTimeout(() => {
        console.error("Forced shutdown after timeout");
        process.exit(1);
      }, 10000);
    } else {
      await closePool();
      process.exit(1);
    }
  } catch (err) {
    console.error("Unexpected shutdown error:", err);
    process.exit(1);
  }
};

const globalError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  err.success = err.success ?? false;

  if (err.name === "ValidationError") err = handleValidationErrorDB(err);

  if (err.name === "JsonWebTokenError") err = handleJwtInvalidSignature();

  if (err.name === "TokenExpiredError") err = handleJwtExpired();

  if (err.code === 11000) err = handleDuplicateFieldsDB(err);

  if (process.env.NODE_ENV === "development") {
    sendErrorForDev(err, res);
  } else {
    sendErrorForProd(err, res);
  }
};

export { globalError, gracefulShutdown };
