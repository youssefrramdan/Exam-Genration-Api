# Question Management

## Overview

This module manages questions and choices for exams in the Online Exam Platform. It supports MCQ (Multiple Choice Questions) and True/False questions.

---

## Features

✅ **Question CRUD** - Create, read, update, and delete questions
✅ **MCQ Support** - Multiple choice questions with 2-4 choices
✅ **True/False Support** - Simple true/false questions
✅ **Two Response Formats** - Array format and pivoted format
✅ **Course Association** - Questions linked to specific courses

---

## Database Schema

### Questions Table

```sql
CREATE TABLE Questions (
    question_id INT PRIMARY KEY IDENTITY(1,1),
    question_text NVARCHAR(MAX) NOT NULL,
    question_type NVARCHAR(50) NOT NULL, -- 'MCQ' or 'TF'
    correct_ans NVARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    course_id INT,
    FOREIGN KEY (course_id) REFERENCES courses(course_id)
);
```

### Choices Table

```sql
CREATE TABLE Choices (
    choice_id INT PRIMARY KEY IDENTITY(1,1),
    question_id INT NOT NULL,
    choice_text NVARCHAR(255) NOT NULL,
    FOREIGN KEY (question_id) REFERENCES Questions(question_id) ON DELETE CASCADE
);
```

---

## Stored Procedures

### 1. `sp_add_question` - Add Question with Choices

```sql
CREATE OR ALTER PROCEDURE sp_add_question
    @question_text NVARCHAR(MAX),
    @question_type NVARCHAR(50),
    @correct_ans NVARCHAR(255),
    @course_id INT,
    @choice1 NVARCHAR(255) = NULL,
    @choice2 NVARCHAR(255) = NULL,
    @choice3 NVARCHAR(255) = NULL,
    @choice4 NVARCHAR(255) = NULL
AS
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;

        INSERT INTO Questions (question_text, question_type, Correct_Ans, created_at, course_id)
        VALUES (@question_text, @question_type, @correct_ans, GETDATE(), @course_id);

        DECLARE @qid INT = SCOPE_IDENTITY();

        IF @question_type = 'MCQ'
        BEGIN
            IF @choice1 IS NOT NULL INSERT INTO Choices VALUES (@qid, @choice1);
            IF @choice2 IS NOT NULL INSERT INTO Choices VALUES (@qid, @choice2);
            IF @choice3 IS NOT NULL INSERT INTO Choices VALUES (@qid, @choice3);
            IF @choice4 IS NOT NULL INSERT INTO Choices VALUES (@qid, @choice4);
        END

        COMMIT TRANSACTION;
        SELECT @qid AS question_id, 'Question added successfully' AS message;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
```

### 2. `sp_get_question_details` - Get Question (Array Format)

```sql
CREATE OR ALTER PROCEDURE sp_get_question_details
    @question_id INT
AS
BEGIN
    SELECT
        q.question_id,
        q.question_text,
        q.question_type,
        q.correct_ans,
        q.course_id
    FROM Questions q
    WHERE q.question_id = @question_id;

    SELECT
        choice_id,
        choice_text
    FROM Choices
    WHERE question_id = @question_id;
END;
```

### 3. `sp_get_question_details_v2` - Get Question (Pivoted Format)

```sql
CREATE OR ALTER PROCEDURE sp_get_question_details_v2
    @question_id INT
AS
BEGIN
    SELECT
        q.question_id,
        q.question_text,
        q.question_type,
        q.correct_ans,
        q.course_id,
        MAX(CASE WHEN c.rn = 1 THEN c.choice_text END) AS choice1,
        MAX(CASE WHEN c.rn = 2 THEN c.choice_text END) AS choice2,
        MAX(CASE WHEN c.rn = 3 THEN c.choice_text END) AS choice3,
        MAX(CASE WHEN c.rn = 4 THEN c.choice_text END) AS choice4
    FROM Questions q
    LEFT JOIN (
        SELECT
            question_id,
            choice_text,
            ROW_NUMBER() OVER(PARTITION BY question_id ORDER BY choice_id) AS rn
        FROM Choices
    ) c ON q.question_id = c.question_id
    WHERE q.question_id = @question_id
    GROUP BY q.question_id, q.question_text, q.question_type, q.correct_ans, q.course_id;
END;
```

### 4. `sp_update_question` - Update Question

```sql
CREATE OR ALTER PROCEDURE sp_update_question
    @question_id INT,
    @question_text NVARCHAR(MAX),
    @question_type NVARCHAR(50),
    @correct_ans NVARCHAR(255),
    @course_id INT,
    @choice1 NVARCHAR(255) = NULL,
    @choice2 NVARCHAR(255) = NULL,
    @choice3 NVARCHAR(255) = NULL,
    @choice4 NVARCHAR(255) = NULL
AS
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;

        UPDATE Questions
        SET question_text = @question_text,
            question_type = @question_type,
            correct_ans = @correct_ans,
            course_id = @course_id
        WHERE question_id = @question_id;

        DELETE FROM Choices WHERE question_id = @question_id;

        IF @question_type = 'MCQ'
        BEGIN
            IF @choice1 IS NOT NULL INSERT INTO Choices VALUES (@question_id, @choice1);
            IF @choice2 IS NOT NULL INSERT INTO Choices VALUES (@question_id, @choice2);
            IF @choice3 IS NOT NULL INSERT INTO Choices VALUES (@question_id, @choice3);
            IF @choice4 IS NOT NULL INSERT INTO Choices VALUES (@question_id, @choice4);
        END

        COMMIT TRANSACTION;
        SELECT 'Question updated successfully' AS message;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
```

### 5. `sp_delete_question` - Delete Question

```sql
CREATE OR ALTER PROCEDURE sp_delete_question
    @question_id INT
AS
BEGIN
    DELETE FROM Questions WHERE question_id = @question_id;
    SELECT 'Question deleted successfully' AS message;
END;
```

---

## API Endpoints

### 1. Add Question

**Endpoint:** `POST /api/questions`
**Access:** Instructor only

**Request (MCQ):**

```json
{
  "questionText": "What does SQL stand for?",
  "questionType": "MCQ",
  "correctAnswer": "Structured Query Language",
  "courseId": 1,
  "choice1": "Simple Query Language",
  "choice2": "Structured Query Language",
  "choice3": "System Query Language",
  "choice4": "Standard Query Language"
}
```

**Request (True/False):**

```json
{
  "questionText": "SQL is a programming language",
  "questionType": "TF",
  "correctAnswer": "True",
  "courseId": 1
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Question added successfully",
  "data": {
    "id": 43
  }
}
```

---

### 2. Get Question Details (Array Format)

**Endpoint:** `GET /api/questions/:id`
**Access:** Instructor only

**Response (200):**

```json
{
  "success": true,
  "data": {
    "question": {
      "id": 43,
      "text": "What does SQL stand for?",
      "type": "MCQ",
      "correctAnswer": "Structured Query Language",
      "courseId": 1
    },
    "choices": [
      {
        "id": 1,
        "text": "Simple Query Language"
      },
      {
        "id": 2,
        "text": "Structured Query Language"
      }
    ]
  }
}
```

---

### 3. Get Question Details (Pivoted Format)

**Endpoint:** `GET /api/questions/:id/v2`
**Access:** Instructor only

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 43,
    "text": "What does SQL stand for?",
    "type": "MCQ",
    "correctAnswer": "Structured Query Language",
    "courseId": 1,
    "choice1": "Simple Query Language",
    "choice2": "Structured Query Language",
    "choice3": "System Query Language",
    "choice4": "Standard Query Language"
  }
}
```

---

### 4. Update Question

**Endpoint:** `PUT /api/questions/:id`
**Access:** Instructor only

**Request:**

```json
{
  "questionText": "What does SQL stand for? (Updated)",
  "questionType": "MCQ",
  "correctAnswer": "Structured Query Language",
  "courseId": 1,
  "choice1": "Simple Query Language",
  "choice2": "Structured Query Language",
  "choice3": "System Query Language"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Question updated successfully"
}
```

---

### 5. Delete Question

**Endpoint:** `DELETE /api/questions/:id`
**Access:** Instructor only

**Response (200):**

```json
{
  "success": true,
  "message": "Question deleted successfully"
}
```

---

## Usage Examples

### Example 1: Add MCQ Question

```bash
curl -X POST http://localhost:3000/api/questions \
  -H "Authorization: Bearer INSTRUCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "questionText": "What is a primary key?",
    "questionType": "MCQ",
    "correctAnswer": "Unique identifier",
    "courseId": 1,
    "choice1": "Unique identifier",
    "choice2": "Foreign key",
    "choice3": "Index",
    "choice4": "Constraint"
  }'
```

---

### Example 2: Add True/False Question

```bash
curl -X POST http://localhost:3000/api/questions \
  -H "Authorization: Bearer INSTRUCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "questionText": "NULL is the same as zero",
    "questionType": "TF",
    "correctAnswer": "False",
    "courseId": 1
  }'
```

---

## Business Rules

1. **MCQ Validation** - MCQ questions must have 2-4 choices
2. **TF Validation** - True/False questions should not have choices
3. **Correct Answer** - Must match one of the choices for MCQ
4. **Course Association** - Questions must be linked to a course
5. **Cascade Delete** - Deleting a question removes all its choices

---

## Updates & Changes

### Recent Updates (December 2024)

1. ✅ **Two Response Formats** - Array and pivoted formats for flexibility
2. ✅ **Enhanced Validation** - Better validation for MCQ and TF questions
3. ✅ **Transaction Support** - Atomic operations for question and choices
4. ✅ **Cascade Delete** - Automatic cleanup of choices

---

## Related Documentation

- [Course Management](./03-Course-Instructor-Management.md)
- [Exam Management](./06-Exam-Management.md)
- [Complete API Reference](./API-Reference.md)

---

**Last Updated:** December 26, 2024
**Version:** 2.0
**Status:** ✅ Production Ready
