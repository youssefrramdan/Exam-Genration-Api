import express from "express";
const router = express.Router();
import {
  createCourse,
  updateCourse,
  deleteCourse,
  getAllCourses,
  getCourseById,
} from "../controllers/course.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

// Get all courses (accessible to authenticated users)
router.get("/", authenticate, getAllCourses);

// Get course by ID (accessible to authenticated users)
router.get("/:id", authenticate, getCourseById);

// Create course (Instructor only)
router.post("/", authenticate, authorize(["Instructor"]), createCourse);

// Update course (Instructor only)
router.put("/:id", authenticate, authorize(["Instructor"]), updateCourse);

// Delete course (Instructor only)
router.delete("/:id", authenticate, authorize(["Instructor"]), deleteCourse);

export default router;
