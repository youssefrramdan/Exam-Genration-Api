import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import ApiError from "../utils/apiError.js";
/**
 * Verify JWT token and protectedRoutes  user
 * Adds user info to req.user
 */
const protectedRoutes = asyncHandler((req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith(`Bearer`)
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new ApiError(
        "You are not logged in. Please log in to access this route",
        401
      )
    );
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = {
    userId: decoded.userId,
    role: decoded.role,
  };

  next();
});

/**
 * allowTo user based on role
 * @param {Array<string>} allowedRoles - Roles that are allowed to access the route
 * @returns {Function} Middleware function
 */

const allowTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "UnallowTod: user not authenticated", false);
    }

    const userRole = String(req.user.role || "").toLowerCase();
    const allowedRoles = roles.map((role) => String(role).toLowerCase());

    if (!allowedRoles.includes(userRole)) {
      throw new ApiError(
        403,
        "You do not have permission to perform this action",
        false
      );
    }

    next();
  });

export default allowTo;

export { protectedRoutes, allowTo };
