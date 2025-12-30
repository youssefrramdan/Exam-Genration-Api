import asyncHandler from "express-async-handler";
import { sql, executeStoredProcedure } from "../config/db.js";
import ApiError from "../utils/apiError.js";

/**
 * Create Track
 */
export const createTrack = asyncHandler(async (req, res, next) => {
  const { name, managerId } = req.body;

  if (!name || !managerId) {
    return next(
      new ApiError(400, "Please provide track name and manager ID", false)
    );
  }

  const result = await executeStoredProcedure("sp_insert_track", {
    tr_name: { type: sql.VarChar(100), value: name },
    manager_id: { type: sql.Int, value: parseInt(managerId) },
  });

  if (!result.recordset || result.recordset.length === 0) {
    return next(new ApiError(400, "Track name already exists", false));
  }

  const track = result.recordset[0];

  res.status(201).json({
    success: true,
    message: "Track created successfully",
    data: {
      id: track.tr_id,
      name: track.tr_name,
      managerId: track.manager_id,
    },
  });
});

/**
 * Update Track
 */
export const updateTrack = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, managerId } = req.body;

  if (!name && !managerId) {
    return next(
      new ApiError(
        400,
        "Please provide at least track name or manager ID",
        false
      )
    );
  }

  const result = await executeStoredProcedure("sp_update_track", {
    tr_id: { type: sql.Int, value: parseInt(id) },
    tr_name: { type: sql.VarChar(100), value: name || null },
    manager_id: {
      type: sql.Int,
      value: managerId ? parseInt(managerId) : null,
    },
  });

  if (!result.recordset || result.recordset.length === 0) {
    return next(new ApiError(404, "Track not found", false));
  }

  const track = result.recordset[0];

  res.status(200).json({
    success: true,
    message: "Track updated successfully",
    data: {
      id: track.tr_id,
      name: track.tr_name,
      managerId: track.manager_id,
    },
  });
});

/**
 * Delete Track
 */
export const deleteTrack = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const result = await executeStoredProcedure("sp_delete_track", {
    tr_id: { type: sql.Int, value: parseInt(id) },
  });

  if (!result.rowsAffected || result.rowsAffected[0] === 0) {
    return next(
      new ApiError(
        409,
        "Track not found or cannot be deleted due to related data",
        false
      )
    );
  }

  res.status(200).json({
    success: true,
    message: "Track deleted successfully",
  });
});

/**
 * Get All Tracks
 */
export const getAllTracks = asyncHandler(async (req, res) => {
  const result = await executeStoredProcedure("sp_select_tracks");

  res.status(200).json({
    success: true,
    count: result.recordset.length,
    data: result.recordset.map((track) => ({
      id: track.tr_id,
      name: track.tr_name,
      managerId: track.manager_id,
      managerName: track.manager_name || null,
      managerEmail: track.manager_email || null,
    })),
  });
});

/**
 * Get Track By ID
 */
export const getTrackById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const result = await executeStoredProcedure("sp_select_tracks_byid", {
    tr_id: { type: sql.Int, value: parseInt(id) },
  });

  if (!result.recordset || result.recordset.length === 0) {
    return next(new ApiError(404, "Track not found", false));
  }

  const track = result.recordset[0];

  res.status(200).json({
    success: true,
    data: {
      id: track.tr_id,
      name: track.tr_name,
      managerId: track.manager_id,
      managerName: track.manager_name || null,
      managerEmail: track.manager_email || null,
    },
  });
});
