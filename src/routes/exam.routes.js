import express from "express";
const router = express.Router();
import { protectedRoutes, allowTo } from "../middlewares/auth.middleware.js";
import {
  generateExam,
  getExamQuestions,
  assignQuestionGrade,
  validateExamGrade,
  finalizeExam,
  getInstructorExams,
  getAvailableExamsForStudent,
  submitExamAnswers,
  correctExam,
  getStudentExams,
} from "../controllers/exam.controller.js";

// Generate exam (Instructor only)
router.post("/generate", protectedRoutes, allowTo("Instructor"), generateExam);

// Get instructor's exams (Instructor only)
router.get(
  "/instructor/my-exams",
  protectedRoutes,
  allowTo("Instructor"),
  getInstructorExams
);

// Assign question grade (Instructor only)
router.post(
  "/assign-grade",
  protectedRoutes,
  allowTo("Instructor"),
  assignQuestionGrade
);

// Validate exam grade (Instructor only)
router.get(
  "/:id/validate",
  protectedRoutes,
  allowTo("Instructor"),
  validateExamGrade
);

// Finalize exam (Instructor only)
router.post(
  "/:id/finalize",
  protectedRoutes,
  allowTo("Instructor"),
  finalizeExam
);


// Student Routes

// Get available exams (Student only)
router.get(
  "/student/available",
  protectedRoutes,
  allowTo("Student"),
  getAvailableExamsForStudent
);

// Get student's taken exams (Student only)
router.get(
  "/student/my-exams",
  protectedRoutes,
  allowTo("Student"),
  getStudentExams
);

// Submit all exam answers (Student only)
router.post(
  "/student/submit-answers",
  protectedRoutes,
  allowTo("Student"),
  submitExamAnswers
);

// Correct exam and get results (Student only)
router.get(
  "/student/:examId/correct",
  protectedRoutes,
  allowTo("Student"),
  correctExam
);

// Shared Routes (Both Instructor & Student)
// Get exam questions (Both roles)
router.get(
  "/:id/questions",
  protectedRoutes,
  allowTo("Instructor", "Student"),
  getExamQuestions
);

export default router;
