import asyncHandler from "express-async-handler";
import { sql, executeStoredProcedure } from "../config/db.js";
import ApiError from "../utils/apiError.js";

// =============================================
// Create Course
// =============================================
export const createCourse = asyncHandler(async (req, res, next) => {
  const { name, code, duration } = req.body;

  if (!name || !code || !duration) {
    return next(
      new ApiError(400, "Please provide course name, code, and duration", false)
    );
  }

  if (duration <= 0) {
    return next(new ApiError(400, "Duration must be a positive number", false));
  }

  try {
    await executeStoredProcedure("sp_insert_course", {
      name: { type: sql.NVarChar(150), value: name },
      code: { type: sql.NVarChar(50), value: code },
      duration: { type: sql.Int, value: parseInt(duration) },
    });
  } catch (error) {
    if (error.message && error.message.toLowerCase().includes("duplicate")) {
      return next(new ApiError(400, "Course code already exists", false));
    }
    throw error;
  }

  res.status(201).json({
    success: true,
    message: "Course created successfully",
    data: {
      name,
      code,
      duration: parseInt(duration),
    },
  });
});

// =============================================
// Update Course
// =============================================
export const updateCourse = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, code, duration } = req.body;

  if (!name && !code && !duration) {
    return next(
      new ApiError(400, "Please provide at least one field to update", false)
    );
  }

  if (duration && duration <= 0) {
    return next(new ApiError(400, "Duration must be a positive number", false));
  }

  await executeStoredProcedure("sp_update_course", {
    id: { type: sql.Int, value: parseInt(id) },
    name: { type: sql.NVarChar(100), value: name || null },
    code: { type: sql.NVarChar(150), value: code || null },
    duration: { type: sql.Int, value: duration ? parseInt(duration) : null },
  });

  res.status(200).json({
    success: true,
    message: "Course updated successfully",
    data: {
      id: parseInt(id),
      name,
      code,
      duration: duration ? parseInt(duration) : undefined,
    },
  });
});

// =============================================
// Delete Course
// =============================================
export const deleteCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await executeStoredProcedure("sp_delete_course", {
    id: { type: sql.Int, value: parseInt(id) },
  });

  res.status(200).json({
    success: true,
    message: "Course deleted successfully",
  });
});

// =============================================
// Get All Courses
// =============================================
export const getAllCourses = asyncHandler(async (req, res, next) => {
  const result = await executeStoredProcedure("sp_select_courses");

  if (!result.recordset) {
    return next(new ApiError(500, "No response from database", false));
  }

  res.status(200).json({
    success: true,
    count: result.recordset.length,
    data: result.recordset.map((course) => ({
      id: course.course_id,
      name: course.course_name,
      code: course.course_code,
      duration: course.duration,
    })),
  });
});

// =============================================
// Get Course by ID
// =============================================
export const getCourseById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const result = await executeStoredProcedure("sp_select_course", {
    id: { type: sql.Int, value: parseInt(id) },
  });

  if (!result.recordset || result.recordset.length === 0) {
    return next(new ApiError(404, "Course not found", false));
  }

  const course = result.recordset[0];

  res.status(200).json({
    success: true,
    data: {
      id: course.course_id,
      name: course.course_name,
      code: course.course_code,
      duration: course.duration,
    },
  });
});
