import express from "express";
const router = express.Router();
import {
  assignTrackToBranch,
  updateBranchTrackRelation,
  removeTrackFromBranch,
  getAllBranchTrackRelations,
  getBranchTrackRelation,
} from "../controllers/branch-track.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

// Get all branch-track relations (accessible to authenticated users)
router.get("/", authenticate, getAllBranchTrackRelations);

// Get specific branch-track relation (accessible to authenticated users)
router.get("/:branchId/:trackId", authenticate, getBranchTrackRelation);

// Assign track to branch (Instructor only)
router.post("/", authenticate, authorize(["Instructor"]), assignTrackToBranch);

// Update branch-track relation (Instructor only)
router.put(
  "/:branchId/:trackId",
  authenticate,
  authorize(["Instructor"]),
  updateBranchTrackRelation
);

// Remove track from branch (Instructor only)
router.delete(
  "/:branchId/:trackId",
  authenticate,
  authorize(["Instructor"]),
  removeTrackFromBranch
);

export default router;
