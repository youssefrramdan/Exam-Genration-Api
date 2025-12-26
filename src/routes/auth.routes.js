import express from "express";
import {
  login,
  addUserStudent,
  addUserInstructor,
  getProfile,
  changePassword,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @route   POST /api/auth/add-user/student
 * @desc    Add a new student
 * @access  Public
 */
router.post("/add-user/student", addUserStudent);

/**
 * @route   POST /api/auth/add-user/instructor
 * @desc    Add a new instructor
 * @access  Public
 */
router.post("/add-user/instructor", addUserInstructor);

/**
 * @route   POST /api/auth/login
 * @desc    Login user (Student or Instructor)
 * @access  Public
 */
router.post("/login", login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/me", authenticate, getProfile);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put("/change-password", authenticate, changePassword);

export default router;
