import express from "express";
const router = express.Router();
import { protectedRoutes, allowTo } from "../middlewares/auth.middleware.js";
import {
  getAllStudents,
  updateStudent,
  deleteStudent,
  getStudentCourses,
  assignCourseToStudent,
  removeCourseFromStudent,
} from "../controllers/student.controller.js";

// Get all students (Instructor only)
router.get("/", protectedRoutes, allowTo("Instructor"), getAllStudents);

// Update student (Instructor only)
router.put("/:id", protectedRoutes, allowTo("Instructor"), updateStudent);

// Delete student (Instructor only)
router.delete("/:id", protectedRoutes, allowTo("Instructor"), deleteStudent);

// Get student's courses
// - Student can view their own courses
// - Instructor can view any student's courses
router.get(
  "/courses/:id",
  protectedRoutes,
  allowTo("Student", "Instructor"),
  getStudentCourses
);

// Assign course to student (Instructor only)
router.post(
  "/assign-course",
  protectedRoutes,
  allowTo("Instructor"),
  assignCourseToStudent
);

// Remove course from student (Instructor only)
router.delete(
  "/assign-course/:studentId/:courseId",
  protectedRoutes,
  allowTo("Instructor"),
  removeCourseFromStudent
);

export default router;
