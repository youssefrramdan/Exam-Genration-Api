# Exam Management

## Overview

This is the most comprehensive module in the Online Exam Platform. It handles exam generation, question assignment, grading, student submissions, and automatic correction.

---

## Features

✅ **Auto Exam Generation** - Random question selection from course pool
✅ **Question Grading** - Assign individual grades to questions
✅ **Exam Finalization** - Lock exam configuration before student access
✅ **Batch Answer Submission** - Submit all answers at once
✅ **Auto-Correction** - Automatic grading and result calculation
✅ **Student Access Control** - Only show finalized exams to enrolled students

---

## Database Schema

### Exams Table

```sql
CREATE TABLE exams (
    exam_id INT PRIMARY KEY IDENTITY(1,1),
    exam_title NVARCHAR(150) NOT NULL,
    exam_type NVARCHAR(50), -- 'Midterm', 'Final'
    exam_duration INT, -- in minutes
    tf_count INT,
    mcq_count INT,
    Exam_Grade INT,
    is_finalized BIT DEFAULT 0,
    created_by INT,
    course_id INT,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (created_by) REFERENCES instructors(instructor_id),
    FOREIGN KEY (course_id) REFERENCES courses(course_id)
);
```

### Exam_Question Table

```sql
CREATE TABLE exam_question (
    exam_id INT NOT NULL,
    question_id INT NOT NULL,
    question_grade INT DEFAULT 0,
    PRIMARY KEY (exam_id, question_id),
    FOREIGN KEY (exam_id) REFERENCES exams(exam_id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES Questions(question_id) ON DELETE CASCADE
);
```

### Student_Answers Table

```sql
CREATE TABLE student_answers (
    answer_id INT PRIMARY KEY IDENTITY(1,1),
    exam_id INT NOT NULL,
    student_id INT NOT NULL,
    question_id INT NOT NULL,
    student_answer NVARCHAR(255),
    FOREIGN KEY (exam_id) REFERENCES exams(exam_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (question_id) REFERENCES Questions(question_id)
);
```

### Student_Exam Table

```sql
CREATE TABLE student_exam (
    exam_id INT NOT NULL,
    student_id INT NOT NULL,
    final_grade INT,
    PRIMARY KEY (exam_id, student_id),
    FOREIGN KEY (exam_id) REFERENCES exams(exam_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id)
);
```

---

## Stored Procedures

### 1. `sp_exam_genration` - Generate Exam

```sql
CREATE OR ALTER PROCEDURE sp_exam_genration
    @title NVARCHAR(150),
    @type NVARCHAR(50),
    @exam_duration INT,
    @tf_count INT,
    @mcq_count INT,
    @Exam_Grade INT,
    @created_by INT,
    @course_id INT
AS
BEGIN
    -- Validate question availability
    -- Insert exam
    -- Randomly select MCQ questions
    -- Randomly select TF questions
    -- Return exam_id
END;
```

### 2. `sp_select_exam_question` - Get Exam Questions

```sql
CREATE OR ALTER PROCEDURE sp_select_exam_question
    @exam_id INT
AS
BEGIN
    -- Return questions with pivoted choices
END;
```

### 3. `sp_assign_question_grade` - Assign Grade

```sql
CREATE OR ALTER PROCEDURE sp_assign_question_grade
    @exam_id INT,
    @question_id INT,
    @question_grade INT
AS
BEGIN
    -- Validate exam not finalized
    -- Update question grade
END;
```

### 4. `sp_validate_exam_grade` - Validate Grades

```sql
CREATE OR ALTER PROCEDURE sp_validate_exam_grade
    @exam_id INT
AS
BEGIN
    -- Check total question grades = exam grade
END;
```

### 5. `sp_finalize_exam` - Finalize Exam

```sql
CREATE OR ALTER PROCEDURE sp_finalize_exam
    @exam_id INT
AS
BEGIN
    -- Validate grades
    -- Set is_finalized = 1
END;
```

### 6. `sp_get_instructor_exams` - Get Instructor's Exams

```sql
CREATE OR ALTER PROCEDURE sp_get_instructor_exams
    @instructor_id INT
AS
BEGIN
    -- Return exams with question count
END;
```

### 7. `sp_get_available_exams_for_student` - Get Available Exams

```sql
CREATE OR ALTER PROCEDURE sp_get_available_exams_for_student
    @student_id INT
AS
BEGIN
    -- Return finalized exams for enrolled courses
    -- Exclude already-taken exams
END;
```

### 8. `sp_submit_exam_answers` - Submit Answer

```sql
CREATE OR ALTER PROCEDURE sp_submit_exam_answers
    @exam_id INT,
    @student_id INT,
    @question_id INT,
    @student_answer NVARCHAR(255)
AS
BEGIN
    -- Validate exam is finalized
    -- Insert answer
END;
```

### 9. `exam_correction` - Auto-Correct Exam

```sql
CREATE OR ALTER PROCEDURE exam_correction
    @exam_id INT,
    @student_id INT
AS
BEGIN
    -- Calculate final grade
    -- Insert/update student_exam
    -- Return correction details
END;
```

### 10. `sp_select_student_exams` - Get Student's Exams

```sql
CREATE OR ALTER PROCEDURE sp_select_student_exams
    @student_id INT
AS
BEGIN
    -- Return taken exams
END;
```

---

## API Endpoints

### Instructor APIs

#### 1. Generate Exam

**Endpoint:** `POST /api/exams/generate`
**Access:** Instructor only

**Request:**

```json
{
  "title": "SQL Basics Midterm",
  "type": "Midterm",
  "duration": 60,
  "tfCount": 5,
  "mcqCount": 10,
  "examGrade": 30,
  "courseId": 1
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Exam generated successfully",
  "data": {
    "examId": 3,
    "title": "SQL Basics Midterm",
    "type": "Midterm",
    "duration": 60,
    "tfCount": 5,
    "mcqCount": 10,
    "examGrade": 30,
    "courseId": 1
  }
}
```

---

#### 2. Get My Exams

**Endpoint:** `GET /api/exams/instructor/my-exams`
**Access:** Instructor only

**Response (200):**

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 3,
      "title": "SQL Basics Midterm",
      "type": "Midterm",
      "duration": 60,
      "grade": 30,
      "isFinalized": true,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "courseName": "Database Systems",
      "questionsCount": 15
    }
  ]
}
```

---

#### 3. Get Exam Questions

**Endpoint:** `GET /api/exams/:id/questions`
**Access:** Instructor & Student

**Response (200):**

```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "questionId": 43,
      "questionText": "What does SQL stand for?",
      "questionType": "MCQ",
      "questionGrade": 2,
      "choice1": "Simple Query Language",
      "choice2": "Structured Query Language",
      "choice3": "System Query Language",
      "choice4": null
    }
  ]
}
```

---

#### 4. Assign Question Grade

**Endpoint:** `POST /api/exams/assign-grade`
**Access:** Instructor only

**Request:**

```json
{
  "examId": 3,
  "questionId": 43,
  "questionGrade": 2
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Question grade assigned successfully",
  "data": {
    "examId": 3,
    "questionId": 43,
    "questionGrade": 2
  }
}
```

---

#### 5. Validate Exam Grade

**Endpoint:** `GET /api/exams/:id/validate`
**Access:** Instructor only

**Response (200):**

```json
{
  "success": true,
  "message": "Exam grade is valid"
}
```

---

#### 6. Finalize Exam

**Endpoint:** `POST /api/exams/:id/finalize`
**Access:** Instructor only

**Response (200):**

```json
{
  "success": true,
  "message": "Exam finalized successfully"
}
```

---

### Student APIs

#### 7. Get Available Exams

**Endpoint:** `GET /api/exams/student/available`
**Access:** Student only

**Response (200):**

```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": 3,
      "title": "SQL Basics Midterm",
      "type": "Midterm",
      "duration": 60,
      "grade": 30,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "createdBy": "Dr. Mohamed Hassan",
      "courseName": "Database Systems"
    }
  ]
}
```

---

#### 8. Get My Taken Exams

**Endpoint:** `GET /api/exams/student/my-exams`
**Access:** Student only

**Response (200):**

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 3,
      "title": "SQL Basics Midterm",
      "grade": 30,
      "duration": 60,
      "isFinalized": true,
      "createdBy": 1
    }
  ]
}
```

---

#### 9. Submit All Answers

**Endpoint:** `POST /api/exams/student/submit-answers`
**Access:** Student only

**Request:**

```json
{
  "examId": 3,
  "answers": [
    {
      "questionId": 159,
      "studentAnswer": "True"
    },
    {
      "questionId": 161,
      "studentAnswer": "Model is too simple"
    },
    {
      "questionId": 163,
      "studentAnswer": "Regression models"
    }
  ]
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "All 3 answers submitted successfully",
  "data": {
    "examId": 3,
    "totalAnswers": 3,
    "successCount": 3
  }
}
```

---

#### 10. Get Exam Results

**Endpoint:** `GET /api/exams/student/:examId/correct`
**Access:** Student only

**Response (200):**

```json
{
  "success": true,
  "message": "Exam corrected successfully",
  "data": {
    "finalGrade": 24,
    "questions": [
      {
        "questionId": 159,
        "questionText": "Linear Regression is used for predicting continuous...",
        "questionType": "TF",
        "choice1": null,
        "choice2": null,
        "choice3": null,
        "choice4": null,
        "correctAnswer": "True",
        "studentAnswer": "True",
        "result": "Correct"
      },
      {
        "questionId": 161,
        "questionText": "What does 'Overfitting' mean?",
        "questionType": "MCQ",
        "choice1": "Model is too simple",
        "choice2": "Model fits noise in training data",
        "choice3": "Model works well on test data",
        "choice4": "Model is too fast",
        "correctAnswer": "Model fits noise in training data",
        "studentAnswer": "Model is too simple",
        "result": "Wrong"
      }
    ]
  }
}
```

---

## Complete Exam Workflow

### Instructor Workflow

```
1. Generate Exam
   POST /api/exams/generate
   ↓
2. View Questions
   GET /api/exams/:id/questions
   ↓
3. Assign Grades to Each Question
   POST /api/exams/assign-grade (repeat for each question)
   ↓
4. Validate Total Grades
   GET /api/exams/:id/validate
   ↓
5. Finalize Exam (Make Available to Students)
   POST /api/exams/:id/finalize
```

### Student Workflow

```
1. View Available Exams
   GET /api/exams/student/available
   ↓
2. Get Exam Questions
   GET /api/exams/:id/questions
   ↓
3. Submit All Answers
   POST /api/exams/student/submit-answers
   ↓
4. Get Results
   GET /api/exams/student/:examId/correct
   ↓
5. View Exam History
   GET /api/exams/student/my-exams
```

---

## Business Rules

1. **Random Selection** - Questions are randomly selected using `NEWID()`
2. **Grade Validation** - Total question grades must equal exam grade
3. **Finalization Lock** - Cannot modify exam after finalization
4. **Enrollment Check** - Students only see exams for enrolled courses
5. **Duplicate Prevention** - Students cannot retake the same exam
6. **Auto-Correction** - Answers are automatically graded on submission
7. **Batch Submission** - All answers submitted in one request

---

## Updates & Changes

### Recent Updates (December 2024)

1. ✅ **Batch Answer Submission** - Submit all answers at once
2. ✅ **Shared Question API** - Both instructors and students can view questions
3. ✅ **Role-Based Response** - Students don't see question grades
4. ✅ **Enhanced Validation** - Better error handling
5. ✅ **Auto-Correction** - Immediate results after submission

---

## Usage Examples

### Example 1: Complete Instructor Flow

```bash
# Generate Exam
curl -X POST http://localhost:3000/api/exams/generate \
  -H "Authorization: Bearer INSTRUCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "SQL Basics Midterm",
    "type": "Midterm",
    "duration": 60,
    "tfCount": 5,
    "mcqCount": 10,
    "examGrade": 30,
    "courseId": 1
  }'

# Assign Grades
curl -X POST http://localhost:3000/api/exams/assign-grade \
  -H "Authorization: Bearer INSTRUCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "examId": 3,
    "questionId": 43,
    "questionGrade": 2
  }'

# Validate
curl -X GET http://localhost:3000/api/exams/3/validate \
  -H "Authorization: Bearer INSTRUCTOR_TOKEN"

# Finalize
curl -X POST http://localhost:3000/api/exams/3/finalize \
  -H "Authorization: Bearer INSTRUCTOR_TOKEN"
```

---

### Example 2: Complete Student Flow

```bash
# Get Available Exams
curl -X GET http://localhost:3000/api/exams/student/available \
  -H "Authorization: Bearer STUDENT_TOKEN"

# Get Questions
curl -X GET http://localhost:3000/api/exams/3/questions \
  -H "Authorization: Bearer STUDENT_TOKEN"

# Submit Answers
curl -X POST http://localhost:3000/api/exams/student/submit-answers \
  -H "Authorization: Bearer STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "examId": 3,
    "answers": [
      {"questionId": 159, "studentAnswer": "True"},
      {"questionId": 161, "studentAnswer": "Model is too simple"}
    ]
  }'

# Get Results
curl -X GET http://localhost:3000/api/exams/student/3/correct \
  -H "Authorization: Bearer STUDENT_TOKEN"
```

---

## Related Documentation

- [Question Management](./05-Question-Management.md)
- [Student Management](./04-Student-Management.md)
- [Course Management](./03-Course-Instructor-Management.md)
- [Complete API Reference](./API-Reference.md)

---

**Last Updated:** December 26, 2024
**Version:** 2.0
**Status:** ✅ Production Ready
