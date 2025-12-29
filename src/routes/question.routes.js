import express from "express";
const router = express.Router();
import { protectedRoutes, allowTo } from "../middlewares/auth.middleware.js";
import {
  addQuestion,
  getQuestionDetails,
  getQuestionDetailsV2,
  updateQuestion,
  deleteQuestion,
} from "../controllers/question.controller.js";

// Add question (Instructor only)
router.post("/", protectedRoutes, allowTo("Instructor"), addQuestion);

// Get question details (with choices as array)
router.get("/:id", protectedRoutes, allowTo("Instructor"), getQuestionDetails);

// Get question details V2 (with choices as columns - optimized for UI)
router.get(
  "/:id/v2",
  protectedRoutes,
  allowTo("Instructor"),
  getQuestionDetailsV2
);

// Update question (Instructor only)
router.put("/:id", protectedRoutes, allowTo("Instructor"), updateQuestion);

// Delete question (Instructor only)
router.delete("/:id", protectedRoutes, allowTo("Instructor"), deleteQuestion);

export default router;
