import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sql, executeStoredProcedure } from "../config/db.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "express-async-handler";

/**
 * Login user (Student or Instructor)
 * @route POST /api/auth/login
 * @access Public
 */
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ApiError(400, "Please provide email and password", false));
  }
  const result = await executeStoredProcedure("sp_login", {
    email: { type: sql.VarChar(100), value: email },
  });

  if (!result.recordset || result.recordset.length === 0) {
    return next(new ApiError(401, "Invalid email or password", false));
  }

  const user = result.recordset[0];

  if (!user.is_active) {
    return next(new ApiError(403, "Your account has been deactivated", false));
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return next(new ApiError(401, "Invalid email or password", false));
  }

  const token = jwt.sign(
    {
      userId: user.user_id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    }
  );

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      token,
      user: {
        id: user.user_id,
        name: user.full_name,
        email: user.email,
        role: user.role,
      },
    },
  });
});

/**
 * Get current user profile
 * @route GET /api/auth/me
 * @access Private
 */
const getProfile = asyncHandler(async (req, res, next) => {
  const { userId, role } = req.user;
  let procedureName;
  const params = {
    id: { type: sql.Int, value: userId },
  };
  if (role === "Student") {
    procedureName = "sp_select_student";
  } else if (role === "Instructor") {
    procedureName = "sp_select_instructor";
  } else {
    return next(new ApiError(400, "Invalid user role"));
  }

  const result = await executeStoredProcedure(procedureName, params);

  if (!result.recordset || result.recordset.length === 0) {
    return next(404, "User not found");
  }

  delete userProfile.password;

  res.status(200).json({
    success: true,
    data: userProfile,
  });
});

/**
 * Change password
 * @route PUT /api/auth/change-password
 * @access Private
 */
const changePassword = asyncHandler(async (req, res, next) => {
  const { userId, role } = req.user;
  const { currentPassword, newPassword } = req.body;

  // Validation
  if (!currentPassword || !newPassword) {
    return next(
      new ApiError(400, "Please provide current password and new password")
    );
  }

  if (newPassword.length < 6) {
    return next(
      new ApiError(400, "New password must be at least 6 characters long")
    );
  }

  // Get user's current password hash
  // sp_get_student_password and sp_get_instructor_password
  const getProcedure =
    role === "Student"
      ? "sp_get_student_password"
      : "sp_get_instructor_password";

  const result = await executeStoredProcedure(getProcedure, {
    id: { type: sql.Int, value: userId },
  });

  if (!result.recordset || result.recordset.length === 0) {
    return next(new ApiError(404, "User not found"));
  }

  const user = result.recordset[0];
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

  if (!isPasswordValid) {
    return next(new ApiError(400, "Current password is incorrect"));
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(
    newPassword,
    parseInt(process.env.BCRYPT_ROUNDS) || 10
  );

  // Update password using stored procedure
  // sp_update_student_password and sp_update_instructor_password
  const updateProcedure =
    role === "Student"
      ? "sp_update_student_password"
      : "sp_update_instructor_password";

  await executeStoredProcedure(updateProcedure, {
    id: { type: sql.Int, value: userId },
    password: { type: sql.VarChar(255), value: hashedPassword },
  });

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});

/**
 * Add student user
 * @route POST /api/auth/add-user/student
 * @access Public
 */
const addUserStudent = async (req, res,next) => {
  const { name, email, password, dateOfBirth, trackId, phone, address } =
    req.body;

  if (!name || !email || !password || !dateOfBirth || !trackId) {
    return next(
      new ApiError(
        400,
        "Please provide name, email, password, date of birth, and track ID"
      )
    );
  }

  // Validate password strength
  if (password.length < 6) {
    return next(
      new ApiError(400, "Password must be at least 6 characters long")
    );
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(
    password,
    parseInt(process.env.BCRYPT_ROUNDS) || 10
  );

  // Call stored procedure
  const result = await executeStoredProcedure("sp_add_user_student", {
    student_name: { type: sql.VarChar(100), value: name },
    student_email: { type: sql.VarChar(100), value: email },
    password: { type: sql.VarChar(255), value: hashedPassword },
    date_of_birth: { type: sql.Date, value: new Date(dateOfBirth) },
    tr_id: { type: sql.Int, value: trackId },
    phone: { type: sql.VarChar(20), value: phone || null },
    address: { type: sql.VarChar(255), value: address || null },
  });

  const data = result.recordset[0];

  // Check if adding failed
  if (data.result === -1) {
    return next(new ApiError(400, data.message));
  }

  // Generate JWT token
  const token = jwt.sign(
    {
      userId: data.user_id,
      role: data.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    }
  );

  res.status(201).json({
    success: true,
    message: "Student added successfully",
    data: {
      token,
      user: {
        id: data.user_id,
        name: data.full_name,
        email: data.email,
        role: data.role,
      },
    },
  });
};

/**
 * Add instructor user
 * @route POST /api/auth/add-user/instructor
 * @access Public
 */
const addUserInstructor = async (req, res,next) => {
  const { name, email, password, dateOfBirth, phone, specialization } =
    req.body;

  if (!name || !email || !password || !dateOfBirth) {
    return next(
      new ApiError(400, "Please provide name, email, password, date of birth")
    );
  }

  // Validate password strength
  if (password.length < 6) {
    return next(
      new ApiError(400, "Password must be at least 6 characters long")
    );
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(
    password,
    parseInt(process.env.BCRYPT_ROUNDS) || 10
  );

  // Call stored procedure
  const result = await executeStoredProcedure("sp_add_user_instructor", {
    instructor_name: { type: sql.VarChar(100), value: name },
    instructor_email: { type: sql.VarChar(100), value: email },
    password: { type: sql.VarChar(255), value: hashedPassword },
    date_of_birth: { type: sql.Date, value: new Date(dateOfBirth) },
    phone: { type: sql.VarChar(20), value: phone || null },
    specialization: { type: sql.VarChar(100), value: specialization || null },
  });

  const data = result.recordset[0];

  // Check if adding failed
  if (data.result === -1) {
    return next(new ApiError(400, data.message));
  }

  // Generate JWT token
  const token = jwt.sign(
    {
      userId: data.user_id,
      role: data.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    }
  );

  // Return success response
  res.status(201).json({
    success: true,
    message: "Instructor added successfully",
    data: {
      token,
      user: {
        id: data.user_id,
        name: data.full_name,
        email: data.email,
        role: data.role,
      },
    },
  });
};

export { login, addUserStudent, addUserInstructor, getProfile, changePassword };
