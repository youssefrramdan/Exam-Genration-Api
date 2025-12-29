import express from "express";
const router = express.Router();
import {
  createCourse,
  updateCourse,
  deleteCourse,
  getAllCourses,
  getCourseById,
} from "../controllers/course.controller.js";
import { protectedRoutes, allowTo } from "../middlewares/auth.middleware.js";

// Get all courses
router.get("/", protectedRoutes, getAllCourses);

// Get course by ID
router.get("/:id", protectedRoutes, getCourseById);

// Create course (Instructor only)
router.post("/", protectedRoutes, allowTo("Instructor"), createCourse);

// Update course (Instructor only)
router.put("/:id", protectedRoutes, allowTo("Instructor"), updateCourse);

// Delete course (Instructor only)
router.delete("/:id", protectedRoutes, allowTo("Instructor"), deleteCourse);

export default router;
