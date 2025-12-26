import { sql, executeStoredProcedure } from "../config/db.js";

// =============================================
// Assign Track to Branch
// =============================================
export const assignTrackToBranch = async (req, res) => {
  try {
    const { branchId, trackId } = req.body;

    // Validation
    if (!branchId || !trackId) {
      return res.status(400).json({
        success: false,
        message: "Please provide both branch ID and track ID",
      });
    }

    // Call stored procedure
    const result = await executeStoredProcedure("sp_branch_track_insert", {
      br_id: { type: sql.Int, value: parseInt(branchId) },
      tr_id: { type: sql.Int, value: parseInt(trackId) },
    });

    // Check if result has data
    if (!result.recordset || result.recordset.length === 0) {
      return res.status(500).json({
        success: false,
        message: "No response from database",
      });
    }

    const data = result.recordset[0];

    // Check for error messages
    if (data.message) {
      const msg = data.message.toLowerCase();

      if (msg.includes("does not exist") || msg.includes("not found")) {
        return res.status(404).json({
          success: false,
          message: data.message,
        });
      }

      if (msg.includes("already exists")) {
        return res.status(400).json({
          success: false,
          message: "This track is already assigned to this branch",
        });
      }

      if (msg.includes("error")) {
        return res.status(400).json({
          success: false,
          message: data.errormessage || data.message,
        });
      }
    }

    // Success
    return res.status(201).json({
      success: true,
      message: "Track assigned to branch successfully",
      data: {
        branchId: parseInt(branchId),
        trackId: parseInt(trackId),
      },
    });
  } catch (error) {
    console.error("Error in assignTrackToBranch:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while assigning track to branch",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// =============================================
// Update Branch-Track Relation
// =============================================
export const updateBranchTrackRelation = async (req, res) => {
  try {
    const { branchId, trackId } = req.params;
    const { newBranchId, newTrackId } = req.body;

    // Validation
    if (!newBranchId && !newTrackId) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least new branch ID or new track ID",
      });
    }

    // Call stored procedure
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

    // Check if result has data
    if (!result.recordset || result.recordset.length === 0) {
      return res.status(500).json({
        success: false,
        message: "No response from database",
      });
    }

    const data = result.recordset[0];

    // Check for error messages
    if (data.message) {
      const msg = data.message.toLowerCase();

      if (msg.includes("does not exist") || msg.includes("not found")) {
        return res.status(404).json({
          success: false,
          message: data.message,
        });
      }
    }

    // Success
    return res.status(200).json({
      success: true,
      message: "Branch-track relation updated successfully",
      data: {
        oldBranchId: parseInt(branchId),
        oldTrackId: parseInt(trackId),
        newBranchId: newBranchId ? parseInt(newBranchId) : parseInt(branchId),
        newTrackId: newTrackId ? parseInt(newTrackId) : parseInt(trackId),
      },
    });
  } catch (error) {
    console.error("Error in updateBranchTrackRelation:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating branch-track relation",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// =============================================
// Remove Track from Branch
// =============================================
export const removeTrackFromBranch = async (req, res) => {
  try {
    const { branchId, trackId } = req.params;

    // Call stored procedure
    const result = await executeStoredProcedure("sp_branch_track_delete", {
      br_id: { type: sql.Int, value: parseInt(branchId) },
      tr_id: { type: sql.Int, value: parseInt(trackId) },
    });

    // Check if result has data
    if (!result.recordset || result.recordset.length === 0) {
      return res.status(500).json({
        success: false,
        message: "No response from database",
      });
    }

    const data = result.recordset[0];

    // Check for error messages
    if (
      data.message &&
      (data.message.toLowerCase().includes("does not exist") ||
        data.message.toLowerCase().includes("not found"))
    ) {
      return res.status(404).json({
        success: false,
        message: "Branch-track relation not found",
      });
    }

    // Success
    return res.status(200).json({
      success: true,
      message: "Track removed from branch successfully",
    });
  } catch (error) {
    console.error("Error in removeTrackFromBranch:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while removing track from branch",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// =============================================
// Get All Branch-Track Relations
// =============================================
export const getAllBranchTrackRelations = async (req, res) => {
  try {
    // Call stored procedure
    const result = await executeStoredProcedure("sp_branch_track_select", {});

    // Check if result has data
    if (!result.recordset) {
      return res.status(500).json({
        success: false,
        message: "No response from database",
      });
    }

    // Success
    return res.status(200).json({
      success: true,
      count: result.recordset.length,
      data: result.recordset.map((relation) => ({
        branchId: relation.br_id,
        trackId: relation.tr_id,
      })),
    });
  } catch (error) {
    console.error("Error in getAllBranchTrackRelations:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching branch-track relations",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// =============================================
// Get Branch-Track Relation by IDs
// =============================================
export const getBranchTrackRelation = async (req, res) => {
  try {
    const { branchId, trackId } = req.params;

    // Call stored procedure
    const result = await executeStoredProcedure("sp_branch_track_selectbypk", {
      br_id: { type: sql.Int, value: parseInt(branchId) },
      tr_id: { type: sql.Int, value: parseInt(trackId) },
    });

    // Check if result has data
    if (!result.recordset || result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Branch-track relation not found",
      });
    }

    const data = result.recordset[0];

    // Check for error messages
    if (data.message && data.message.toLowerCase().includes("does not exist")) {
      return res.status(404).json({
        success: false,
        message: "Branch-track relation not found",
      });
    }

    // Success
    return res.status(200).json({
      success: true,
      data: {
        branchId: data.br_id,
        trackId: data.tr_id,
      },
    });
  } catch (error) {
    console.error("Error in getBranchTrackRelation:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching branch-track relation",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
