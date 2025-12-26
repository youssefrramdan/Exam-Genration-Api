import jwt from "jsonwebtoken";

/**
 * Verify JWT token and authenticate user
 * Adds user info to req.user
 */
const authenticate = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Invalid token format.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user info to request
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired. Please login again.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please login again.",
      });
    }

    console.error("Authentication error:", error);
    return res.status(500).json({
      success: false,
      message: "Authentication failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Authorize user based on role
 * @param {Array<string>} allowedRoles - Roles that are allowed to access the route
 * @returns {Function} Middleware function
 */
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Get user role (case-insensitive)
    const userRole = String(req.user.role || "").toLowerCase();

    // Check if user role is in allowed roles (case-insensitive)
    const isAllowed = allowedRoles.some(
      (role) => String(role).toLowerCase() === userRole
    );

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Only ${allowedRoles.join(
          ", "
        )} can access this resource.`,
      });
    }

    next();
  };
};

export { authenticate, authorize };
