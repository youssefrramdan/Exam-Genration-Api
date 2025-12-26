import { sql, executeStoredProcedure } from "../config/db.js";

// =============================================
// Create Branch
// =============================================
export const createBranch = async (req, res) => {
  try {
    const { name } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Please provide branch name",
      });
    }

    // Call stored procedure
    const result = await executeStoredProcedure("sp_insert_branch", {
      br_name: { type: sql.VarChar(100), value: name },
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
      message: "Branch created successfully",
      data: {
        id: data.br_id,
        name: data.br_name,
      },
    });
  } catch (error) {
    console.error("Error in createBranch:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while creating branch",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// =============================================
// Update Branch
// =============================================
export const updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Please provide branch name",
      });
    }

    // Call stored procedure
    const result = await executeStoredProcedure("sp_update_branch", {
      br_id: { type: sql.Int, value: parseInt(id) },
      br_name: { type: sql.VarChar(100), value: name },
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
        message: "Branch not found",
      });
    }

    // Success
    return res.status(200).json({
      success: true,
      message: "Branch updated successfully",
      data: {
        id: parseInt(id),
        name: name,
      },
    });
  } catch (error) {
    console.error("Error in updateBranch:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating branch",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// =============================================
// Delete Branch
// =============================================
export const deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;

    // Call stored procedure
    const result = await executeStoredProcedure("sp_delete_branch", {
      br_id: { type: sql.Int, value: parseInt(id) },
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
        message: "Branch not found",
      });
    }

    // Success
    return res.status(200).json({
      success: true,
      message: "Branch deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteBranch:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting branch",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// =============================================
// Get All Branches
// =============================================
export const getAllBranches = async (req, res) => {
  try {
    // Call stored procedure
    const result = await executeStoredProcedure("sp_select_branches", {});

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
      data: result.recordset.map((branch) => ({
        id: branch.br_id,
        name: branch.br_name,
      })),
    });
  } catch (error) {
    console.error("Error in getAllBranches:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching branches",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// =============================================
// Get Branch by ID
// =============================================
export const getBranchById = async (req, res) => {
  try {
    const { id } = req.params;

    // Call stored procedure
    const result = await executeStoredProcedure("sp_select_branches_byid", {
      br_id: { type: sql.Int, value: parseInt(id) },
    });

    // Check if result has data
    if (!result.recordset || result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    const data = result.recordset[0];

    // Check for error messages
    if (data.message && data.message.toLowerCase().includes("does not exist")) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    // Success
    return res.status(200).json({
      success: true,
      data: {
        id: data.br_id,
        name: data.br_name,
      },
    });
  } catch (error) {
    console.error("Error in getBranchById:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching branch",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
