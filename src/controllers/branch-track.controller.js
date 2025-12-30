import asyncHandler from "express-async-handler";
import { sql, executeStoredProcedure } from "../config/db.js";
import ApiError from "../utils/apiError.js";

// =============================================
// Assign Track to Branch
// =============================================
export const assignTrackToBranch = asyncHandler(async (req, res, next) => {
  const { branchId, trackId } = req.body;

  if (!branchId || !trackId) {
    return next(
      new ApiError(400, "Please provide both branch ID and track ID", false)
    );
  }

  const result = await executeStoredProcedure("sp_branch_track_insert", {
    br_id: { type: sql.Int, value: parseInt(branchId) },
    tr_id: { type: sql.Int, value: parseInt(trackId) },
  });

  if (!result.recordset || result.recordset.length === 0) {
    return next(new ApiError(500, "No response from database", false));
  }

  const data = result.recordset[0];

  if (data.message) {
    const msg = data.message.toLowerCase();

    if (msg.includes("does not exist") || msg.includes("not found")) {
      return next(new ApiError(404, data.message, false));
    }

    if (msg.includes("already exists")) {
      return next(
        new ApiError(
          409,
          "This track is already assigned to this branch",
          false
        )
      );
    }

    if (msg.includes("error")) {
      return next(new ApiError(400, data.errormessage || data.message, false));
    }
  }

  res.status(201).json({
    success: true,
    message: "Track assigned to branch successfully",
    data: {
      branchId: parseInt(branchId),
      trackId: parseInt(trackId),
    },
  });
});

// =============================================
// Update Branch-Track Relation
// =============================================
export const updateBranchTrackRelation = asyncHandler(
  async (req, res, next) => {
    const { branchId, trackId } = req.params;
    const { newBranchId, newTrackId } = req.body;

    if (!newBranchId && !newTrackId) {
      return next(
        new ApiError(
          400,
          "Please provide at least new branch ID or new track ID",
          false
        )
      );
    }

    const result = await executeStoredProcedure("sp_branch_track_update", {
      br_id: { type: sql.Int, value: parseInt(branchId) },
      tr_id: { type: sql.Int, value: parseInt(trackId) },
      new_br_id: {
        type: sql.Int,
        value: newBranchId ? parseInt(newBranchId) : null,
      },
      new_tr_id: {
        type: sql.Int,
        value: newTrackId ? parseInt(newTrackId) : null,
      },
    });

    if (!result.recordset || result.recordset.length === 0) {
      return next(new ApiError(500, "No response from database", false));
    }

    const data = result.recordset[0];

    if (data.message) {
      const msg = data.message.toLowerCase();
      if (msg.includes("does not exist") || msg.includes("not found")) {
        return next(new ApiError(404, data.message, false));
      }
    }

    res.status(200).json({
      success: true,
      message: "Branch-track relation updated successfully",
      data: {
        oldBranchId: parseInt(branchId),
        oldTrackId: parseInt(trackId),
        newBranchId: newBranchId ? parseInt(newBranchId) : parseInt(branchId),
        newTrackId: newTrackId ? parseInt(newTrackId) : parseInt(trackId),
      },
    });
  }
);

// =============================================
// Remove Track from Branch
// =============================================
export const removeTrackFromBranch = asyncHandler(async (req, res, next) => {
  const { branchId, trackId } = req.params;

  const result = await executeStoredProcedure("sp_branch_track_delete", {
    br_id: { type: sql.Int, value: parseInt(branchId) },
    tr_id: { type: sql.Int, value: parseInt(trackId) },
  });

  if (!result.recordset || result.recordset.length === 0) {
    return next(new ApiError(500, "No response from database", false));
  }

  const data = result.recordset[0];

  if (
    data.message &&
    (data.message.toLowerCase().includes("does not exist") ||
      data.message.toLowerCase().includes("not found"))
  ) {
    return next(new ApiError(404, "Branch-track relation not found", false));
  }

  res.status(200).json({
    success: true,
    message: "Track removed from branch successfully",
  });
});

// =============================================
// Get All Branch-Track Relations
// =============================================
export const getAllBranchTrackRelations = asyncHandler(
  async (req, res, next) => {
    const result = await executeStoredProcedure("sp_branch_track_select");

    if (!result.recordset) {
      return next(new ApiError(500, "No response from database", false));
    }

    res.status(200).json({
      success: true,
      count: result.recordset.length,
      data: result.recordset.map((relation) => ({
        branchId: relation.br_id,
        trackId: relation.tr_id,
      })),
    });
  }
);

// =============================================
// Get Branch-Track Relation by IDs
// =============================================
export const getBranchTrackRelation = asyncHandler(async (req, res, next) => {
  const { branchId, trackId } = req.params;

  const result = await executeStoredProcedure("sp_branch_track_selectbypk", {
    br_id: { type: sql.Int, value: parseInt(branchId) },
    tr_id: { type: sql.Int, value: parseInt(trackId) },
  });

  if (!result.recordset || result.recordset.length === 0) {
    return next(new ApiError(404, "Branch-track relation not found", false));
  }

  const data = result.recordset[0];

  if (data.message && data.message.toLowerCase().includes("does not exist")) {
    return next(new ApiError(404, "Branch-track relation not found", false));
  }

  res.status(200).json({
    success: true,
    data: {
      branchId: data.br_id,
      trackId: data.tr_id,
    },
  });
});
