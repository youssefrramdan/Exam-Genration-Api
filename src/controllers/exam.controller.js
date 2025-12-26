import { sql, executeStoredProcedure } from "../config/db.js";

// =============================================
// Generate Exam (Instructor Only)
// =============================================
export const generateExam = async (req, res) => {
  try {
    const { title, type, duration, tfCount, mcqCount, examGrade, courseId } =
      req.body;

    const { userId } = req.user; // Instructor ID from JWT

    // Validation
    if (!title || !type || !duration || !examGrade || !courseId) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide title, type, duration, exam grade, and course ID",
      });
    }

    if (tfCount === undefined || mcqCount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide TF count and MCQ count",
      });
    }

    const result = await executeStoredProcedure("sp_exam_genration", {
      title: { type: sql.NVarChar(150), value: title },
      type: { type: sql.NVarChar(50), value: type },
      exam_duration: { type: sql.Int, value: parseInt(duration) },
      tf_count: { type: sql.Int, value: parseInt(tfCount) },
      mcq_count: { type: sql.Int, value: parseInt(mcqCount) },
      Exam_Grade: { type: sql.Int, value: parseInt(examGrade) },
      created_by: { type: sql.Int, value: userId },
      course_id: { type: sql.Int, value: parseInt(courseId) },
    });

    const response = result.recordset[0];

    // Check for validation errors
    if (response.Result) {
      return res.status(201).json({
        success: true,
        message: response.Result,
        data: {
          examId: response.Exam_ID,
          title,
          type,
          duration: parseInt(duration),
          tfCount: parseInt(tfCount),
          mcqCount: parseInt(mcqCount),
          examGrade: parseInt(examGrade),
          courseId: parseInt(courseId),
        },
      });
    } else {
      // Error message from SP
      const errorMessage = Object.values(response)[0];
      return res.status(400).json({
        success: false,
        message: errorMessage,
      });
    }
  } catch (error) {
    console.error("Error in generateExam:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while generating exam",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// =============================================
// Get Exam Questions (Instructor & Student)
// =============================================
export const getExamQuestions = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.user;

    const result = await executeStoredProcedure("sp_select_exam_question", {
      exam_id: { type: sql.Int, value: parseInt(id) },
    });

    if (!result.recordset || result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No questions found for this exam",
      });
    }

    // For students, don't include question grades (they shouldn't see individual grades)
    // For instructors, include all details
    return res.status(200).json({
      success: true,
      count: result.recordset.length,
      data: result.recordset.map((q) => ({
        questionId: q.question_id,
        questionText: q.question_text,
        questionType: q.question_type,
        questionGrade: role === "Instructor" ? q.question_grade : undefined,
        choice1: q.choice1 || null,
        choice2: q.choice2 || null,
        choice3: q.choice3 || null,
        choice4: q.choice4 || null,
      })),
    });
  } catch (error) {
    console.error("Error in getExamQuestions:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching exam questions",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// =============================================
// Assign Question Grade (Instructor Only)
// =============================================
export const assignQuestionGrade = async (req, res) => {
  try {
    const { examId, questionId, questionGrade } = req.body;

    // Validation
    if (!examId || !questionId || questionGrade === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide exam ID, question ID, and question grade",
      });
    }

    const result = await executeStoredProcedure("sp_assign_question_grade", {
      exam_id: { type: sql.Int, value: parseInt(examId) },
      question_id: { type: sql.Int, value: parseInt(questionId) },
      question_grade: { type: sql.Int, value: parseInt(questionGrade) },
    });

    const response = result.recordset[0];
    const message = response.message || Object.values(response)[0];

    if (message.includes("successfully")) {
      return res.status(200).json({
        success: true,
        message,
        data: {
          examId: parseInt(examId),
          questionId: parseInt(questionId),
          questionGrade: parseInt(questionGrade),
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        message,
      });
    }
  } catch (error) {
    console.error("Error in assignQuestionGrade:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while assigning question grade",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// =============================================
// Validate Exam Grade (Instructor Only)
// =============================================
export const validateExamGrade = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await executeStoredProcedure("sp_validate_exam_grade", {
      exam_id: { type: sql.Int, value: parseInt(id) },
    });

    const response = result.recordset[0];
    const message = response.Result || Object.values(response)[0];

    if (message.includes("valid")) {
      return res.status(200).json({
        success: true,
        message,
      });
    } else {
      return res.status(400).json({
        success: false,
        message,
      });
    }
  } catch (error) {
    console.error("Error in validateExamGrade:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while validating exam grade",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// =============================================
// Finalize Exam (Instructor Only)
// =============================================
export const finalizeExam = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await executeStoredProcedure("sp_finalize_exam", {
      exam_id: { type: sql.Int, value: parseInt(id) },
    });

    const response = result.recordset[result.recordset.length - 1]; // Last result
    const message = response.Result || Object.values(response)[0];

    if (message.includes("successfully")) {
      return res.status(200).json({
        success: true,
        message,
      });
    } else {
      return res.status(400).json({
        success: false,
        message,
      });
    }
  } catch (error) {
    console.error("Error in finalizeExam:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while finalizing exam",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// =============================================
// Get Instructor Exams (Instructor Only)
// =============================================
export const getInstructorExams = async (req, res) => {
  try {
    const { userId } = req.user; // Instructor ID from JWT

    const result = await executeStoredProcedure("sp_get_instructor_exams", {
      instructor_id: { type: sql.Int, value: userId },
    });

    if (!result.recordset) {
      return res.status(500).json({
        success: false,
        message: "No response from database",
      });
    }

    // Check for error message
    if (result.recordset.length > 0 && result.recordset[0].message) {
      return res.status(404).json({
        success: false,
        message: result.recordset[0].message,
      });
    }

    return res.status(200).json({
      success: true,
      count: result.recordset.length,
      data: result.recordset.map((exam) => ({
        id: exam.exam_id,
        title: exam.exam_title,
        type: exam.exam_type,
        duration: exam.exam_duration,
        grade: exam.Exam_Grade,
        isFinalized: exam.is_finalized,
        createdAt: exam.created_at,
        courseName: exam.course_name,
        questionsCount: exam.questions_count,
      })),
    });
  } catch (error) {
    console.error("Error in getInstructorExams:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching instructor exams",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// =============================================
// Get Available Exams for Student (Student Only)
// =============================================
export const getAvailableExamsForStudent = async (req, res) => {
  try {
    const { userId } = req.user; // Student ID from JWT

    const result = await executeStoredProcedure(
      "sp_get_available_exams_for_student",
      {
        student_id: { type: sql.Int, value: userId },
      }
    );

    if (!result.recordset) {
      return res.status(500).json({
        success: false,
        message: "No response from database",
      });
    }

    return res.status(200).json({
      success: true,
      count: result.recordset.length,
      data: result.recordset.map((exam) => ({
        id: exam.exam_id,
        title: exam.exam_title,
        type: exam.exam_type,
        duration: exam.exam_duration,
        grade: exam.Exam_Grade,
        createdAt: exam.created_at,
        createdBy: exam.created_by_name,
        courseName: exam.course_name,
      })),
    });
  } catch (error) {
    console.error("Error in getAvailableExamsForStudent:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching available exams",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// =============================================
// Submit Exam Answers (Student Only) - Submit All Answers at Once
// =============================================
export const submitExamAnswers = async (req, res) => {
  try {
    const { examId, answers } = req.body;
    const { userId } = req.user; // Student ID from JWT

    // Validation
    if (
      !examId ||
      !answers ||
      !Array.isArray(answers) ||
      answers.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide exam ID and an array of answers",
      });
    }

    // Validate each answer has questionId and studentAnswer
    for (const answer of answers) {
      if (!answer.questionId || !answer.studentAnswer) {
        return res.status(400).json({
          success: false,
          message: "Each answer must have questionId and studentAnswer",
        });
      }
    }

    // Submit all answers
    const errors = [];
    let successCount = 0;

    for (const answer of answers) {
      try {
        const result = await executeStoredProcedure("sp_submit_exam_answers", {
          exam_id: { type: sql.Int, value: parseInt(examId) },
          student_id: { type: sql.Int, value: userId },
          question_id: { type: sql.Int, value: parseInt(answer.questionId) },
          student_answer: {
            type: sql.NVarChar(255),
            value: answer.studentAnswer,
          },
        });

        // Check for error messages from SP
        if (result.recordset && result.recordset.length > 0) {
          const message = Object.values(result.recordset[0])[0];
          if (
            message &&
            typeof message === "string" &&
            !message.includes("successfully")
          ) {
            errors.push({
              questionId: answer.questionId,
              error: message,
            });
          } else {
            successCount++;
          }
        } else {
          successCount++;
        }
      } catch (error) {
        errors.push({
          questionId: answer.questionId,
          error: error.message,
        });
      }
    }

    // Return response
    if (errors.length === 0) {
      return res.status(201).json({
        success: true,
        message: `All ${successCount} answers submitted successfully`,
        data: {
          examId: parseInt(examId),
          totalAnswers: answers.length,
          successCount,
        },
      });
    } else if (successCount > 0) {
      return res.status(207).json({
        success: true,
        message: `${successCount} answers submitted, ${errors.length} failed`,
        data: {
          examId: parseInt(examId),
          totalAnswers: answers.length,
          successCount,
          errors,
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Failed to submit answers",
        errors,
      });
    }
  } catch (error) {
    console.error("Error in submitExamAnswers:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while submitting answers",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// =============================================
// Correct Exam (Student Only)
// =============================================
export const correctExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const { userId } = req.user; // Student ID from JWT

    const result = await executeStoredProcedure("exam_correction", {
      exam_id: { type: sql.Int, value: parseInt(examId) },
      student_id: { type: sql.Int, value: userId },
    });

    if (!result.recordset || result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No exam data found",
      });
    }

    const finalGrade = result.recordset[0].final_grade;

    return res.status(200).json({
      success: true,
      message: "Exam corrected successfully",
      data: {
        finalGrade,
        questions: result.recordset.map((q) => ({
          questionId: q.question_id,
          questionText: q.question_text,
          questionType: q.question_type,
          choice1: q.choice1 || null,
          choice2: q.choice2 || null,
          choice3: q.choice3 || null,
          choice4: q.choice4 || null,
          correctAnswer: q.correct_ans,
          studentAnswer: q.student_answer,
          result: q.result,
        })),
      },
    });
  } catch (error) {
    console.error("Error in correctExam:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while correcting exam",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// =============================================
// Get Student Exams (Student Only)
// =============================================
export const getStudentExams = async (req, res) => {
  try {
    const { userId } = req.user; // Student ID from JWT

    const result = await executeStoredProcedure("sp_select_student_exams", {
      student_id: { type: sql.Int, value: userId },
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
      data: result.recordset.map((exam) => ({
        id: exam.exam_id,
        title: exam.exam_title,
        grade: exam.Exam_Grade,
        duration: exam.exam_duration,
        isFinalized: exam.is_finalized,
        createdBy: exam.created_by,
      })),
    });
  } catch (error) {
    console.error("Error in getStudentExams:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching student exams",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
