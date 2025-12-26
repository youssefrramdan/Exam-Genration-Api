import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sql, executeStoredProcedure } from "../config/db.js";

/**
 * Login user (Student or Instructor)
 * @route POST /api/auth/login
 * @access Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Call stored procedure sp_login
    const result = await executeStoredProcedure("sp_login", {
      email: { type: sql.VarChar(100), value: email },
    });

    // Check if user exists
    if (!result.recordset || result.recordset.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = result.recordset[0];

    // Check if account is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Please contact support.",
      });
    }

    // Compare password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
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

    // Return success response
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
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during login",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get current user profile
 * @route GET /api/auth/me
 * @access Private
 */
const getProfile = async (req, res) => {
  try {
    const { userId, role } = req.user;

    // Determine which stored procedure to call based on role
    let procedureName;
    let params;

    if (role === "Student") {
      // Call sp_select_student or similar (you may need to create this)
      procedureName = "sp_select_students";
      params = {};
    } else if (role === "Instructor") {
      procedureName = "sp_select_instructor";
      params = {
        id: { type: sql.Int, value: userId },
      };
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid user role",
      });
    }

    const result = await executeStoredProcedure(procedureName, params);

    if (!result.recordset || result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Filter by userId if getting all students
    let userProfile = result.recordset[0];
    if (role === "Student") {
      userProfile = result.recordset.find((s) => s.student_id === userId);
      if (!userProfile) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }
    }

    // Remove sensitive data
    delete userProfile.password;

    res.status(200).json({
      success: true,
      data: userProfile,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching profile",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Change password
 * @route PUT /api/auth/change-password
 * @access Private
 */
const changePassword = async (req, res) => {
  try {
    const { userId, role } = req.user;
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current password and new password",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    // Get user's current password hash
    // You'll need to create stored procedures: sp_get_student_password and sp_get_instructor_password
    const getProcedure =
      role === "Student"
        ? "sp_get_student_password"
        : "sp_get_instructor_password";

    const result = await executeStoredProcedure(getProcedure, {
      id: { type: sql.Int, value: userId },
    });

    if (!result.recordset || result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = result.recordset[0];

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(
      newPassword,
      parseInt(process.env.BCRYPT_ROUNDS) || 10
    );

    // Update password using stored procedure
    // You'll need to create: sp_update_student_password and sp_update_instructor_password
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
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while changing password",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Add student user
 * @route POST /api/auth/add-user/student
 * @access Public
 */
const addUserStudent = async (req, res) => {
  try {
    const { name, email, password, dateOfBirth, trackId, phone, address } =
      req.body;

    // Validation
    if (!name || !email || !password || !dateOfBirth || !trackId) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide name, email, password, date of birth, and track ID",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
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

    // Check if registration failed
    if (data.result === -1) {
      return res.status(400).json({
        success: false,
        message: data.message,
      });
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
  } catch (error) {
    console.error("Add student error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while adding student",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Add instructor user
 * @route POST /api/auth/add-user/instructor
 * @access Public
 */
const addUserInstructor = async (req, res) => {
  try {
    const { name, email, password, dateOfBirth, phone, specialization } =
      req.body;

    // Validation
    if (!name || !email || !password || !dateOfBirth) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, password, and date of birth",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
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

    // Check if registration failed
    if (data.result === -1) {
      return res.status(400).json({
        success: false,
        message: data.message,
      });
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
  } catch (error) {
    console.error("Add instructor error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while adding instructor",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export { login, addUserStudent, addUserInstructor, getProfile, changePassword };
