import express from "express";
const router = express.Router();
import {
  createBranch,
  updateBranch,
  deleteBranch,
  getAllBranches,
  getBranchById,
} from "../controllers/branch.controller.js";
import { protectedRoutes, allowTo } from "../middlewares/auth.middleware.js";

// Get all branches
router.get("/", protectedRoutes, getAllBranches);

// Get branch by ID
router.get("/:id", protectedRoutes, getBranchById);

// Create branch (Instructor only)
router.post("/", protectedRoutes, allowTo("Instructor"), createBranch);

// Update branch (Instructor only)
router.put("/:id", protectedRoutes, allowTo("Instructor"), updateBranch);

// Delete branch (Instructor only)
router.delete("/:id", protectedRoutes, allowTo("Instructor"), deleteBranch);

export default router;
