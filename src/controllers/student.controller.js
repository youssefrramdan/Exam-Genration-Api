import { sql, executeStoredProcedure } from "../config/db.js";

// =============================================
// Get All Students
// =============================================
export const getAllStudents = async (req, res) => {
  try {
    const result = await executeStoredProcedure("sp_select_students", {});

    if (!result.recordset) {
      return res.status(500).json({
        success: false,
        message: "No response from database",
      });
    }

    return res.status(200).json({
      success: true,
      count: result.recordset.length,
      data: result.recordset.map((student) => ({
        id: student.student_id,
        name: student.student_name,
        email: student.student_email,
        dateOfBirth: student.date_of_birth,
        trackName: student.tr_name,
      })),
    });
  } catch (error) {
    console.error("Error in getAllStudents:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching students",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// =============================================
// Update Student
// =============================================
export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, dateOfBirth, trackId } = req.body;

    // Validation
    if (!name || !email || !dateOfBirth || !trackId) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, date of birth, and track ID",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    await executeStoredProcedure("sp_update_student", {
      student_id: { type: sql.Int, value: parseInt(id) },
      student_name: { type: sql.VarChar(100), value: name },
      student_email: { type: sql.VarChar(100), value: email },
      date_of_birth: { type: sql.Date, value: new Date(dateOfBirth) },
      tr_id: { type: sql.Int, value: parseInt(trackId) },
    });

    return res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: {
        id: parseInt(id),
        name,
        email,
        dateOfBirth,
        trackId: parseInt(trackId),
      },
    });
  } catch (error) {
    console.error("Error in updateStudent:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating student",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// =============================================
// Delete Student
// =============================================
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    await executeStoredProcedure("sp_delete_student", {
      student_id: { type: sql.Int, value: parseInt(id) },
    });

    return res.status(200).json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteStudent:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting student",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// =============================================
// Get Student Courses
// =============================================
export const getStudentCourses = async (req, res) => {
  try {
    const { userId, role } = req.user;

    // Students can only view their own courses
    // Instructors can view any student's courses
    const studentId = role === "Student" ? userId : req.params.id;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }

    const result = await executeStoredProcedure("sp_get_student_courses", {
      student_id: { type: sql.Int, value: parseInt(studentId) },
    });

    if (!result.recordset) {
      return res.status(500).json({
        success: false,
        message: "No response from database",
      });
    }

    return res.status(200).json({
      success: true,
      count: result.recordset.length,
      data: result.recordset.map((course) => ({
        id: course.course_id,
        name: course.course_name,
        code: course.course_code,
        duration: course.duration,
        enrollDate: course.enroll_date,
      })),
    });
  } catch (error) {
    console.error("Error in getStudentCourses:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching student courses",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// =============================================
// Assign Course to Student
// =============================================
export const assignCourseToStudent = async (req, res) => {
  try {
    const { studentId, courseId } = req.body;

    // Validation
    if (!studentId || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Please provide student ID and course ID",
      });
    }

    await executeStoredProcedure("sp_assign_course_to_student", {
      student_id: { type: sql.Int, value: parseInt(studentId) },
      course_id: { type: sql.Int, value: parseInt(courseId) },
    });

    return res.status(201).json({
      success: true,
      message: "Course assigned to student successfully",
      data: {
        studentId: parseInt(studentId),
        courseId: parseInt(courseId),
      },
    });
  } catch (error) {
    console.error("Error in assignCourseToStudent:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while assigning course to student",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// =============================================
// Remove Course from Student
// =============================================
export const removeCourseFromStudent = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    await executeStoredProcedure("sp_remove_course_from_student", {
      student_id: { type: sql.Int, value: parseInt(studentId) },
      course_id: { type: sql.Int, value: parseInt(courseId) },
    });

    return res.status(200).json({
      success: true,
      message: "Course removed from student successfully",
    });
  } catch (error) {
    console.error("Error in removeCourseFromStudent:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while removing course from student",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
