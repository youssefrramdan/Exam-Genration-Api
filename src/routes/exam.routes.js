import express from "express";
const router = express.Router();
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
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

// =============================================
// Instructor Routes
// =============================================

// Generate exam (Instructor only)
router.post("/generate", authenticate, authorize(["Instructor"]), generateExam);

// Get instructor's exams (Instructor only)
router.get(
  "/instructor/my-exams",
  authenticate,
  authorize(["Instructor"]),
  getInstructorExams
);

// Assign question grade (Instructor only)
router.post(
  "/assign-grade",
  authenticate,
  authorize(["Instructor"]),
  assignQuestionGrade
);

// Validate exam grade (Instructor only)
router.get(
  "/:id/validate",
  authenticate,
  authorize(["Instructor"]),
  validateExamGrade
);

// Finalize exam (Instructor only)
router.post(
  "/:id/finalize",
  authenticate,
  authorize(["Instructor"]),
  finalizeExam
);

// =============================================
// Student Routes
// =============================================

// Get available exams (Student only)
router.get(
  "/student/available",
  authenticate,
  authorize(["Student"]),
  getAvailableExamsForStudent
);

// Get student's taken exams (Student only)
router.get(
  "/student/my-exams",
  authenticate,
  authorize(["Student"]),
  getStudentExams
);

// Submit all exam answers (Student only)
router.post(
  "/student/submit-answers",
  authenticate,
  authorize(["Student"]),
  submitExamAnswers
);

// Correct exam and get results (Student only)
router.get(
  "/student/:examId/correct",
  authenticate,
  authorize(["Student"]),
  correctExam
);

// =============================================
// Shared Routes (Both Instructor & Student)
// =============================================

// Get exam questions (Both roles)
router.get(
  "/:id/questions",
  authenticate,
  authorize(["Instructor", "Student"]),
  getExamQuestions
);

export default router;
