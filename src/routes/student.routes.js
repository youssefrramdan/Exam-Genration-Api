import express from "express";
const router = express.Router();
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import {
  getAllStudents,
  updateStudent,
  deleteStudent,
  getStudentCourses,
  assignCourseToStudent,
  removeCourseFromStudent,
} from "../controllers/student.controller.js";

// Get all students (Instructor only)
router.get("/", authenticate, authorize(["Instructor"]), getAllStudents);

// Update student (Instructor only)
router.put("/:id", authenticate, authorize(["Instructor"]), updateStudent);

// Delete student (Instructor only)
router.delete("/:id", authenticate, authorize(["Instructor"]), deleteStudent);

// Get student's courses
// - Student can view their own courses
// - Instructor can view any student's courses
router.get(
  "/courses/:id?",
  authenticate,
  authorize(["Student", "Instructor"]),
  getStudentCourses
);

// Assign course to student (Instructor only)
router.post(
  "/assign-course",
  authenticate,
  authorize(["Instructor"]),
  assignCourseToStudent
);

// Remove course from student (Instructor only)
router.delete(
  "/assign-course/:studentId/:courseId",
  authenticate,
  authorize(["Instructor"]),
  removeCourseFromStudent
);

export default router;
