import { sql, executeStoredProcedure } from "../config/db.js";

// =============================================
// Add Question (with Choices if MCQ)
// =============================================
export const addQuestion = async (req, res) => {
  try {
    const {
      questionText,
      questionType,
      correctAnswer,
      courseId,
      choice1,
      choice2,
      choice3,
      choice4,
    } = req.body;

    // Validation
    if (!questionText || !questionType || !correctAnswer || !courseId) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide question text, type, correct answer, and course ID",
      });
    }

    // Validate question type
    if (!["MCQ", "TF"].includes(questionType)) {
      return res.status(400).json({
        success: false,
        message: "Question type must be either 'MCQ' or 'TF'",
      });
    }

    // Validate MCQ has at least 2 choices
    if (questionType === "MCQ") {
      const choices = [choice1, choice2, choice3, choice4].filter(Boolean);
      if (choices.length < 2) {
        return res.status(400).json({
          success: false,
          message: "MCQ questions must have at least 2 choices",
        });
      }
    }

    await executeStoredProcedure("sp_add_question", {
      question_text: { type: sql.NVarChar(sql.MAX), value: questionText },
      question_type: { type: sql.NVarChar(50), value: questionType },
      correct_ans: { type: sql.NVarChar(255), value: correctAnswer },
      course_id: { type: sql.Int, value: parseInt(courseId) },
      choice1: { type: sql.NVarChar(255), value: choice1 || null },
      choice2: { type: sql.NVarChar(255), value: choice2 || null },
      choice3: { type: sql.NVarChar(255), value: choice3 || null },
      choice4: { type: sql.NVarChar(255), value: choice4 || null },
    });

    return res.status(201).json({
      success: true,
      message: "Question added successfully",
      data: {
        questionText,
        questionType,
        correctAnswer,
        courseId: parseInt(courseId),
        choices:
          questionType === "MCQ"
            ? [choice1, choice2, choice3, choice4].filter(Boolean)
            : null,
      },
    });
  } catch (error) {
    console.error("Error in addQuestion:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while adding question",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// =============================================
// Get Question Details (with Choices)
// =============================================
export const getQuestionDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await executeStoredProcedure("sp_get_question_details", {
      question_id: { type: sql.Int, value: parseInt(id) },
    });

    if (!result.recordset || result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    // Group choices for the question
    const firstRow = result.recordset[0];
    const question = {
      id: firstRow.question_id,
      text: firstRow.question_text,
      type: firstRow.question_type,
      correctAnswer: firstRow.Correct_Ans,
      courseId: firstRow.course_id,
      choices: result.recordset
        .filter((row) => row.choice_id)
        .map((row) => ({
          id: row.choice_id,
          text: row.choice_text,
        })),
    };

    return res.status(200).json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error("Error in getQuestionDetails:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching question details",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// =============================================
// Get Question Details V2 (Pivoted Choices)
// =============================================
export const getQuestionDetailsV2 = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await executeStoredProcedure("sp_get_question_details_v2", {
      question_id: { type: sql.Int, value: parseInt(id) },
    });

    if (!result.recordset || result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    const row = result.recordset[0];
    const question = {
      id: row.question_id,
      text: row.question_text,
      type: row.question_type,
      correctAnswer: row.Correct_Ans,
      courseId: row.course_id,
      choice1: row.choice1 || null,
      choice2: row.choice2 || null,
      choice3: row.choice3 || null,
      choice4: row.choice4 || null,
    };

    return res.status(200).json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error("Error in getQuestionDetailsV2:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching question details",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// =============================================
// Update Question (with Choices)
// =============================================
export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      questionText,
      questionType,
      correctAnswer,
      choice1,
      choice2,
      choice3,
      choice4,
    } = req.body;

    // Validation
    if (!questionText || !questionType || !correctAnswer) {
      return res.status(400).json({
        success: false,
        message: "Please provide question text, type, and correct answer",
      });
    }

    // Validate question type
    if (!["MCQ", "TF"].includes(questionType)) {
      return res.status(400).json({
        success: false,
        message: "Question type must be either 'MCQ' or 'TF'",
      });
    }

    // Validate MCQ has at least 2 choices
    if (questionType === "MCQ") {
      const choices = [choice1, choice2, choice3, choice4].filter(Boolean);
      if (choices.length < 2) {
        return res.status(400).json({
          success: false,
          message: "MCQ questions must have at least 2 choices",
        });
      }
    }

    await executeStoredProcedure("sp_update_question", {
      question_id: { type: sql.Int, value: parseInt(id) },
      question_text: { type: sql.NVarChar(sql.MAX), value: questionText },
      question_type: { type: sql.NVarChar(50), value: questionType },
      correct_ans: { type: sql.NVarChar(255), value: correctAnswer },
      choice1: { type: sql.NVarChar(255), value: choice1 || null },
      choice2: { type: sql.NVarChar(255), value: choice2 || null },
      choice3: { type: sql.NVarChar(255), value: choice3 || null },
      choice4: { type: sql.NVarChar(255), value: choice4 || null },
    });

    return res.status(200).json({
      success: true,
      message: "Question updated successfully",
      data: {
        id: parseInt(id),
        questionText,
        questionType,
        correctAnswer,
        choices:
          questionType === "MCQ"
            ? [choice1, choice2, choice3, choice4].filter(Boolean)
            : null,
      },
    });
  } catch (error) {
    console.error("Error in updateQuestion:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating question",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// =============================================
// Delete Question (with Choices)
// =============================================
export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    await executeStoredProcedure("sp_delete_question", {
      question_id: { type: sql.Int, value: parseInt(id) },
    });

    return res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteQuestion:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting question",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
