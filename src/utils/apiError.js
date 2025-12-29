class ApiError extends Error {
  constructor(statusCode, message, error = null) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.success = false;
    this.error = error;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
