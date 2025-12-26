import express from "express";
const router = express.Router();
import {
  createTrack,
  updateTrack,
  deleteTrack,
  getAllTracks,
  getTrackById,
} from "../controllers/track.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

// Get all tracks (accessible to authenticated users)
router.get("/", authenticate, getAllTracks);

// Get track by ID (accessible to authenticated users)
router.get("/:id", authenticate, getTrackById);

// Create track (Instructor only)
router.post("/", authenticate, authorize(["Instructor"]), createTrack);

// Update track (Instructor only)
router.put("/:id", authenticate, authorize(["Instructor"]), updateTrack);

// Delete track (Instructor only)
router.delete("/:id", authenticate, authorize(["Instructor"]), deleteTrack);

export default router;
