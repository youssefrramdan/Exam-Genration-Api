import { sql, executeStoredProcedure } from "../config/db.js";

// =============================================
// Create Course
// =============================================
export const createCourse = async (req, res) => {
  try {
    const { name, code, duration } = req.body;

    // Validation
    if (!name || !code || !duration) {
      return res.status(400).json({
        success: false,
        message: "Please provide course name, code, and duration",
      });
    }

    // Validate duration is positive
    if (duration <= 0) {
      return res.status(400).json({
        success: false,
        message: "Duration must be a positive number",
      });
    }

    // Call stored procedure
    await executeStoredProcedure("sp_insert_course", {
      name: { type: sql.NVarChar(150), value: name },
      code: { type: sql.NVarChar(50), value: code },
      duration: { type: sql.Int, value: parseInt(duration) },
    });

    // Success
    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: {
        name,
        code,
        duration: parseInt(duration),
      },
    });
  } catch (error) {
    console.error("Error in createCourse:", error);

    // Check for duplicate course code
    if (error.message && error.message.includes("duplicate")) {
      return res.status(400).json({
        success: false,
        message: "Course code already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "An error occurred while creating course",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// =============================================
// Update Course
// =============================================
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, duration } = req.body;

    // Validation - at least one field required
    if (!name && !code && !duration) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one field to update",
      });
    }

    // Validate duration if provided
    if (duration && duration <= 0) {
      return res.status(400).json({
        success: false,
        message: "Duration must be a positive number",
      });
    }

    // Call stored procedure
    await executeStoredProcedure("sp_update_course", {
      id: { type: sql.Int, value: parseInt(id) },
      name: { type: sql.NVarChar(100), value: name || null },
      code: { type: sql.NVarChar(150), value: code || null },
      duration: { type: sql.Int, value: duration ? parseInt(duration) : null },
    });

    // Success
    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: {
        id: parseInt(id),
        name,
        code,
        duration: duration ? parseInt(duration) : undefined,
      },
    });
  } catch (error) {
    console.error("Error in updateCourse:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating course",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// =============================================
// Delete Course
// =============================================
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    // Call stored procedure
    await executeStoredProcedure("sp_delete_course", {
      id: { type: sql.Int, value: parseInt(id) },
    });

    // Success
    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteCourse:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting course",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// =============================================
// Get All Courses
// =============================================
export const getAllCourses = async (req, res) => {
  try {
    // Call stored procedure
    const result = await executeStoredProcedure("sp_select_courses", {});

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
      data: result.recordset.map((course) => ({
        id: course.course_id,
        name: course.course_name,
        code: course.course_code,
        duration: course.duration,
      })),
    });
  } catch (error) {
    console.error("Error in getAllCourses:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching courses",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// =============================================
// Get Course by ID
// =============================================
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    // Call stored procedure
    const result = await executeStoredProcedure("sp_select_course", {
      id: { type: sql.Int, value: parseInt(id) },
    });

    // Check if result has data
    if (!result.recordset || result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const course = result.recordset[0];

    // Success
    return res.status(200).json({
      success: true,
      data: {
        id: course.course_id,
        name: course.course_name,
        code: course.course_code,
        duration: course.duration,
      },
    });
  } catch (error) {
    console.error("Error in getCourseById:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching course",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
