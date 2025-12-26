import express from "express";
const router = express.Router();
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import {
  addQuestion,
  getQuestionDetails,
  getQuestionDetailsV2,
  updateQuestion,
  deleteQuestion,
} from "../controllers/question.controller.js";

// Add question (Instructor only)
router.post("/", authenticate, authorize(["Instructor"]), addQuestion);

// Get question details (with choices as array)
router.get("/:id", authenticate, authorize(["Instructor"]), getQuestionDetails);

// Get question details V2 (with choices as columns - optimized for UI)
router.get(
  "/:id/v2",
  authenticate,
  authorize(["Instructor"]),
  getQuestionDetailsV2
);

// Update question (Instructor only)
router.put("/:id", authenticate, authorize(["Instructor"]), updateQuestion);

// Delete question (Instructor only)
router.delete("/:id", authenticate, authorize(["Instructor"]), deleteQuestion);

export default router;
