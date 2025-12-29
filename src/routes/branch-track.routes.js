import express from "express";
const router = express.Router();
import {
  assignTrackToBranch,
  updateBranchTrackRelation,
  removeTrackFromBranch,
  getAllBranchTrackRelations,
  getBranchTrackRelation,
} from "../controllers/branch-track.controller.js";
import { protectedRoutes, allowTo } from "../middlewares/auth.middleware.js";

// Get all branch-track relations
router.get("/", protectedRoutes, getAllBranchTrackRelations);

// Get specific branch-track relation 
router.get("/:branchId/:trackId", protectedRoutes, getBranchTrackRelation);

// Assign track to branch (Instructor only)
router.post("/", protectedRoutes, allowTo("Instructor"), assignTrackToBranch);

// Update branch-track relation (Instructor only)
router.put(
  "/:branchId/:trackId",
  protectedRoutes,
  allowTo("Instructor"),
  updateBranchTrackRelation
);

// Remove track from branch (Instructor only)
router.delete(
  "/:branchId/:trackId",
  protectedRoutes,
  allowTo("Instructor"),
  removeTrackFromBranch
);

export default router;
