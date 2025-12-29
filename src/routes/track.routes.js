import express from "express";
const router = express.Router();
import {
  createTrack,
  updateTrack,
  deleteTrack,
  getAllTracks,
  getTrackById,
} from "../controllers/track.controller.js";
import { protectedRoutes, allowTo } from "../middlewares/auth.middleware.js";

// Get all tracks (accessible to protectedRoutes d users)
router.get("/", protectedRoutes, getAllTracks);

// Get track by ID (accessible to protectedRoutes d users)
router.get("/:id", protectedRoutes, getTrackById);

// Create track (Instructor only)
router.post("/", protectedRoutes, allowTo("Instructor"), createTrack);

// Update track (Instructor only)
router.put("/:id", protectedRoutes, allowTo("Instructor"), updateTrack);

// Delete track (Instructor only)
router.delete("/:id", protectedRoutes, allowTo("Instructor"), deleteTrack);

export default router;
