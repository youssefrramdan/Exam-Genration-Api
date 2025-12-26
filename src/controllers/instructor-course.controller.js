import { sql, executeStoredProcedure } from "../config/db.js";

// =============================================
// Get Instructor's Courses
// =============================================
export const getInstructorCourses = async (req, res) => {
  try {
    const { userId } = req.user; // من الـ JWT token

    // Call stored procedure
    const result = await executeStoredProcedure("sp_get_instructor_courses", {
      instructor_id: { type: sql.Int, value: parseInt(userId) },
    });

    // Check if result has data
    if (!result.recordset) {
      return res.status(500).json({
        success: false,
        message: "No response from database",
      });
    }

    // Check for error
    if (result.recordset.length > 0 && result.recordset[0].result === -1) {
      return res.status(404).json({
        success: false,
        message: result.recordset[0].message,
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
    console.error("Error in getInstructorCourses:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching instructor courses",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// =============================================
// Get Instructor's Course Details
// =============================================
export const getInstructorCourseDetails = async (req, res) => {
  try {
    const { userId } = req.user; // من الـ JWT token
    const { courseId } = req.params;

    // Call stored procedure
    const result = await executeStoredProcedure(
      "sp_get_instructor_course_details",
      {
        instructor_id: { type: sql.Int, value: parseInt(userId) },
        course_id: { type: sql.Int, value: parseInt(courseId) },
      }
    );

    // Check if result has data
    if (!result.recordsets || result.recordsets.length === 0) {
      return res.status(500).json({
        success: false,
        message: "No response from database",
      });
    }

    // Check for error
    if (
      result.recordsets[0].length > 0 &&
      result.recordsets[0][0].result === -1
    ) {
      return res.status(403).json({
        success: false,
        message: result.recordsets[0][0].message,
      });
    }

    const courseDetails = result.recordsets[0][0];
    const topics = result.recordsets[1] || [];

    // Success
    return res.status(200).json({
      success: true,
      data: {
        id: courseDetails.course_id,
        name: courseDetails.course_name,
        code: courseDetails.course_code,
        duration: courseDetails.duration,
        instructor: {
          id: courseDetails.instructor_id,
          name: courseDetails.instructor_name,
          email: courseDetails.instructor_email,
        },
        topics: topics.map((t) => t.topic_name),
      },
    });
  } catch (error) {
    console.error("Error in getInstructorCourseDetails:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching course details",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// =============================================
// Get Instructor's Courses with Topics
// =============================================
export const getInstructorCoursesWithTopics = async (req, res) => {
  try {
    const { userId } = req.user; // من الـ JWT token

    // Call stored procedure
    const result = await executeStoredProcedure(
      "sp_get_instructor_courses_with_topics",
      {
        instructor_id: { type: sql.Int, value: parseInt(userId) },
      }
    );

    // Check if result has data
    if (!result.recordset) {
      return res.status(500).json({
        success: false,
        message: "No response from database",
      });
    }

    // Check for error
    if (result.recordset.length > 0 && result.recordset[0].result === -1) {
      return res.status(404).json({
        success: false,
        message: result.recordset[0].message,
      });
    }

    // Group courses with their topics
    const coursesMap = new Map();

    result.recordset.forEach((row) => {
      if (!coursesMap.has(row.course_id)) {
        coursesMap.set(row.course_id, {
          id: row.course_id,
          name: row.course_name,
          code: row.course_code,
          duration: row.duration,
          topics: [],
        });
      }

      if (row.topic_name) {
        coursesMap.get(row.course_id).topics.push(row.topic_name);
      }
    });

    const courses = Array.from(coursesMap.values());

    // Success
    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    console.error("Error in getInstructorCoursesWithTopics:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching instructor courses",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// =============================================
// Assign Instructor to Course
// =============================================
export const assignInstructorToCourse = async (req, res) => {
  try {
    const { instructorId, courseId } = req.body;

    // Validation
    if (!instructorId || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Please provide both instructor ID and course ID",
      });
    }

    // Call stored procedure
    await executeStoredProcedure("sp_assign_instructor_to_course", {
      instructor_id: { type: sql.Int, value: parseInt(instructorId) },
      course_id: { type: sql.Int, value: parseInt(courseId) },
    });

    // Success
    return res.status(201).json({
      success: true,
      message: "Instructor assigned to course successfully",
      data: {
        instructorId: parseInt(instructorId),
        courseId: parseInt(courseId),
      },
    });
  } catch (error) {
    console.error("Error in assignInstructorToCourse:", error);

    // Check for duplicate assignment
    if (
      error.message &&
      (error.message.includes("already assigned") ||
        error.message.includes("duplicate"))
    ) {
      return res.status(400).json({
        success: false,
        message: "Instructor is already assigned to this course",
      });
    }

    return res.status(500).json({
      success: false,
      message: "An error occurred while assigning instructor to course",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// =============================================
// Deassign Instructor from Course
// =============================================
export const deassignInstructorFromCourse = async (req, res) => {
  try {
    const { instructorId, courseId } = req.params;

    // Call stored procedure
    await executeStoredProcedure("sp_deassign_instructor_to_course", {
      instructor_id: { type: sql.Int, value: parseInt(instructorId) },
      course_id: { type: sql.Int, value: parseInt(courseId) },
    });

    // Success
    return res.status(200).json({
      success: true,
      message: "Instructor removed from course successfully",
    });
  } catch (error) {
    console.error("Error in deassignInstructorFromCourse:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while removing instructor from course",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// =============================================
// Add Topic to Course
// =============================================
export const addCourseTopic = async (req, res) => {
  try {
    const { courseId, topicName } = req.body;

    // Validation
    if (!courseId || !topicName) {
      return res.status(400).json({
        success: false,
        message: "Please provide both course ID and topic name",
      });
    }

    // Call stored procedure
    await executeStoredProcedure("sp_add_course_topic", {
      course_id: { type: sql.Int, value: parseInt(courseId) },
      topic_name: { type: sql.NVarChar(150), value: topicName },
    });

    // Success
    return res.status(201).json({
      success: true,
      message: "Topic added to course successfully",
      data: {
        courseId: parseInt(courseId),
        topicName,
      },
    });
  } catch (error) {
    console.error("Error in addCourseTopic:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while adding topic to course",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// =============================================
// Delete Topic from Course
// =============================================
export const deleteCourseTopic = async (req, res) => {
  try {
    const { courseId, topicName } = req.params;

    // Call stored procedure
    await executeStoredProcedure("sp_delete_course_topic", {
      course_id: { type: sql.Int, value: parseInt(courseId) },
      topic_name: {
        type: sql.NVarChar(150),
        value: decodeURIComponent(topicName),
      },
    });

    // Success
    return res.status(200).json({
      success: true,
      message: "Topic removed from course successfully",
    });
  } catch (error) {
    console.error("Error in deleteCourseTopic:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while removing topic from course",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// =============================================
// Assign Instructor to Track
// =============================================
export const assignInstructorToTrack = async (req, res) => {
  try {
    const { instructorId, trackId } = req.body;

    // Validation
    if (!instructorId || !trackId) {
      return res.status(400).json({
        success: false,
        message: "Please provide both instructor ID and track ID",
      });
    }

    // Call stored procedure
    await executeStoredProcedure("sp_assign_instructor_to_track", {
      instructor_id: { type: sql.Int, value: parseInt(instructorId) },
      track_id: { type: sql.Int, value: parseInt(trackId) },
    });

    // Success
    return res.status(201).json({
      success: true,
      message: "Instructor assigned to track successfully",
      data: {
        instructorId: parseInt(instructorId),
        trackId: parseInt(trackId),
      },
    });
  } catch (error) {
    console.error("Error in assignInstructorToTrack:", error);

    // Check for duplicate assignment
    if (
      error.message &&
      (error.message.includes("already assigned") ||
        error.message.includes("duplicate"))
    ) {
      return res.status(400).json({
        success: false,
        message: "Instructor is already assigned to this track",
      });
    }

    return res.status(500).json({
      success: false,
      message: "An error occurred while assigning instructor to track",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
