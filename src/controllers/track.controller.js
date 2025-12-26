import { sql, executeStoredProcedure } from "../config/db.js";

// =============================================
// Create Track
// =============================================
export const createTrack = async (req, res) => {
  try {
    const { name, managerId } = req.body;

    // Validation
    if (!name || !managerId) {
      return res.status(400).json({
        success: false,
        message: "Please provide track name and manager ID",
      });
    }

    // Call stored procedure
    const result = await executeStoredProcedure("sp_insert_track", {
      tr_name: { type: sql.VarChar(100), value: name },
      manager_id: { type: sql.Int, value: parseInt(managerId) },
    });

    // Check if result has data
    if (!result.recordset || result.recordset.length === 0) {
      return res.status(500).json({
        success: false,
        message: "No response from database",
      });
    }

    const data = result.recordset[0];

    // Check for error message
    if (data.message && data.message.toLowerCase().includes("error")) {
      return res.status(400).json({
        success: false,
        message: data.errormessage || data.message,
      });
    }

    // Success
    return res.status(201).json({
      success: true,
      message: "Track created successfully",
      data: {
        id: data.tr_id,
        name: data.tr_name,
        managerId: data.manager_id,
      },
    });
  } catch (error) {
    console.error("Error in createTrack:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while creating track",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// =============================================
// Update Track
// =============================================
export const updateTrack = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, managerId } = req.body;

    // Validation
    if (!name && !managerId) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least track name or manager ID",
      });
    }

    // Call stored procedure
    const result = await executeStoredProcedure("sp_update_track", {
      tr_id: { type: sql.Int, value: parseInt(id) },
      tr_name: { type: sql.VarChar(100), value: name || null },
      manager_id: {
        type: sql.Int,
        value: managerId ? parseInt(managerId) : null,
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
    if (
      data.message &&
      (data.message.toLowerCase().includes("does not exist") ||
        data.message.toLowerCase().includes("not found"))
    ) {
      return res.status(404).json({
        success: false,
        message: "Track not found",
      });
    }

    // Success
    return res.status(200).json({
      success: true,
      message: "Track updated successfully",
      data: {
        id: parseInt(id),
        name: name,
        managerId: managerId ? parseInt(managerId) : undefined,
      },
    });
  } catch (error) {
    console.error("Error in updateTrack:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating track",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// =============================================
// Delete Track
// =============================================
export const deleteTrack = async (req, res) => {
  try {
    const { id } = req.params;

    // Call stored procedure
    const result = await executeStoredProcedure("sp_delete_track", {
      tr_id: { type: sql.Int, value: parseInt(id) },
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
        message: "Track not found",
      });
    }

    // Success
    return res.status(200).json({
      success: true,
      message: "Track deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteTrack:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting track",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// =============================================
// Get All Tracks
// =============================================
export const getAllTracks = async (req, res) => {
  try {
    // Call stored procedure
    const result = await executeStoredProcedure("sp_select_tracks", {});

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
      data: result.recordset.map((track) => ({
        id: track.tr_id,
        name: track.tr_name,
        managerId: track.manager_id,
        managerName: track.manager_name || null,
        managerEmail: track.manager_email || null,
      })),
    });
  } catch (error) {
    console.error("Error in getAllTracks:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching tracks",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// =============================================
// Get Track by ID
// =============================================
export const getTrackById = async (req, res) => {
  try {
    const { id } = req.params;

    // Call stored procedure
    const result = await executeStoredProcedure("sp_select_tracks_byid", {
      tr_id: { type: sql.Int, value: parseInt(id) },
    });

    // Check if result has data
    if (!result.recordset || result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Track not found",
      });
    }

    const data = result.recordset[0];

    // Check for error messages
    if (data.message && data.message.toLowerCase().includes("does not exist")) {
      return res.status(404).json({
        success: false,
        message: "Track not found",
      });
    }

    // Success
    return res.status(200).json({
      success: true,
      data: {
        id: data.tr_id,
        name: data.tr_name,
        managerId: data.manager_id,
        managerName: data.manager_name || null,
        managerEmail: data.manager_email || null,
      },
    });
  } catch (error) {
    console.error("Error in getTrackById:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching track",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
