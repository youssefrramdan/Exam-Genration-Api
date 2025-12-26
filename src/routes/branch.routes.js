import express from "express";
const router = express.Router();
import {
  createBranch,
  updateBranch,
  deleteBranch,
  getAllBranches,
  getBranchById,
} from "../controllers/branch.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

// Public routes (or you can protect them based on your requirements)
// For now, let's protect all branch operations - only Instructors can manage branches

// Get all branches (accessible to authenticated users)
router.get("/", authenticate, getAllBranches);

// Get branch by ID (accessible to authenticated users)
router.get("/:id", authenticate, getBranchById);

// Create branch (Instructor only)
router.post("/", authenticate, authorize(["Instructor"]), createBranch);

// Update branch (Instructor only)
router.put("/:id", authenticate, authorize(["Instructor"]), updateBranch);

// Delete branch (Instructor only)
router.delete("/:id", authenticate, authorize(["Instructor"]), deleteBranch);

export default router;
