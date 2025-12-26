# Student Management

## Overview

This module manages student data, course enrollments, and student-specific operations in the Online Exam Platform.

---

## Features

✅ **Student CRUD** - View, update, and delete students
✅ **Course Enrollment** - Assign/remove courses for students
✅ **Student's Own Courses** - Students can view their enrolled courses
✅ **Track Assignment** - Students are assigned to tracks

---

## Database Schema

### Students Table

```sql
CREATE TABLE students (
    student_id INT PRIMARY KEY IDENTITY(1,1),
    student_name VARCHAR(100) NOT NULL,
    student_email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    phone VARCHAR(20),
    tr_id INT,
    is_active BIT DEFAULT 1,
    FOREIGN KEY (tr_id) REFERENCES tracks(tr_id)
);
```

### Student_Enrollment Table

```sql
CREATE TABLE student_enrollment (
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    enroll_date DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
);
```

---

## Stored Procedures

### 1. `sp_select_students` - Get All Students

```sql
CREATE OR ALTER PROCEDURE sp_select_students
AS
BEGIN
    SELECT
        s.student_id,
        s.student_name,
        s.student_email,
        s.date_of_birth,
        t.tr_name
    FROM students s
    INNER JOIN tracks t ON s.tr_id = t.tr_id;
END;
```

### 2. `sp_update_student` - Update Student

```sql
CREATE OR ALTER PROCEDURE sp_update_student
    @student_id INT,
    @student_name VARCHAR(100),
    @student_email VARCHAR(100),
    @date_of_birth DATE,
    @tr_id INT
AS
BEGIN
    UPDATE students
    SET student_name = @student_name,
        student_email = @student_email,
        date_of_birth = @date_of_birth,
        tr_id = @tr_id
    WHERE student_id = @student_id;
END;
```

### 3. `sp_delete_student` - Delete Student

```sql
CREATE OR ALTER PROCEDURE sp_delete_student
    @student_id INT
AS
BEGIN
    DELETE FROM student_enrollment WHERE student_id = @student_id;
    DELETE FROM student_exam WHERE student_id = @student_id;
    DELETE FROM student_answers WHERE student_id = @student_id;
    DELETE FROM students WHERE student_id = @student_id;
END;
```

### 4. `sp_assign_course_to_student` - Assign Course

```sql
CREATE OR ALTER PROCEDURE sp_assign_course_to_student
    @student_id INT,
    @course_id INT
AS
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM student_enrollment
        WHERE student_id = @student_id AND course_id = @course_id
    )
    BEGIN
        INSERT INTO student_enrollment (student_id, course_id, enroll_date)
        VALUES (@student_id, @course_id, GETDATE());
    END
END;
```

### 5. `sp_remove_course_from_student` - Remove Course

```sql
CREATE OR ALTER PROCEDURE sp_remove_course_from_student
    @student_id INT,
    @course_id INT
AS
BEGIN
    DELETE FROM student_enrollment
    WHERE student_id = @student_id AND course_id = @course_id;
END;
```

### 6. `sp_get_student_courses` - Get Student Courses

```sql
CREATE OR ALTER PROCEDURE sp_get_student_courses
    @student_id INT
AS
BEGIN
    SELECT
        c.course_id,
        c.course_name,
        c.course_code,
        c.duration,
        se.enroll_date
    FROM student_enrollment se
    INNER JOIN courses c ON se.course_id = c.course_id
    WHERE se.student_id = @student_id;
END;
```

---

## API Endpoints

### Instructor APIs (Student Management)

#### 1. Get All Students

**Endpoint:** `GET /api/students`
**Access:** Instructor only

**Response (200):**

```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "id": 1,
      "name": "Ahmed Ali",
      "email": "ahmed@example.com",
      "dateOfBirth": "2000-01-15",
      "trackName": "Full Stack Development"
    }
  ]
}
```

---

#### 2. Update Student

**Endpoint:** `PUT /api/students/:id`
**Access:** Instructor only

**Request:**

```json
{
  "name": "Ahmed Ali Updated",
  "email": "ahmed@example.com",
  "dateOfBirth": "2000-01-15",
  "trackId": 1
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Student updated successfully"
}
```

---

#### 3. Delete Student

**Endpoint:** `DELETE /api/students/:id`
**Access:** Instructor only

**Response (200):**

```json
{
  "success": true,
  "message": "Student deleted successfully"
}
```

---

#### 4. Get Student Courses (by ID)

**Endpoint:** `GET /api/students/courses/:id`
**Access:** Instructor only

**Response (200):**

```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": 1,
      "name": "Database Systems",
      "code": "CS301",
      "duration": 45,
      "enrollDate": "2024-01-15T00:00:00.000Z"
    }
  ]
}
```

---

#### 5. Assign Course to Student

**Endpoint:** `POST /api/students/assign-course`
**Access:** Instructor only

**Request:**

```json
{
  "studentId": 1,
  "courseId": 2
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Course assigned to student successfully"
}
```

---

#### 6. Remove Course from Student

**Endpoint:** `DELETE /api/students/assign-course/:studentId/:courseId`
**Access:** Instructor only

**Response (200):**

```json
{
  "success": true,
  "message": "Course removed from student successfully"
}
```

---

### Student APIs (Own Data)

#### 7. Get My Courses

**Endpoint:** `GET /api/students/courses`
**Access:** Student only

**Response (200):**

```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": 1,
      "name": "Database Systems",
      "code": "CS301",
      "duration": 45,
      "enrollDate": "2024-01-15T00:00:00.000Z"
    }
  ]
}
```

---

## Usage Examples

### Example 1: Instructor Assigns Course to Student

```bash
curl -X POST http://localhost:3000/api/students/assign-course \
  -H "Authorization: Bearer INSTRUCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": 1,
    "courseId": 2
  }'
```

---

### Example 2: Student Views Own Courses

```bash
curl -X GET http://localhost:3000/api/students/courses \
  -H "Authorization: Bearer STUDENT_TOKEN"
```

---

## Business Rules

1. **Duplicate Prevention** - Cannot enroll student in same course twice
2. **Cascade Delete** - Deleting student removes all enrollments and exam data
3. **Track Assignment** - Students must be assigned to a track
4. **Access Control** - Students can only view their own courses

---

## Updates & Changes

### Recent Updates (December 2024)

1. ✅ **Student's Own Courses** - Students can view their enrolled courses
2. ✅ **Enhanced CRUD** - Improved update and delete operations
3. ✅ **Cascade Delete** - Automatic cleanup of related data
4. ✅ **Role-Based Access** - Separate APIs for instructors and students

---

## Related Documentation

- [Authentication & User Management](./01-Authentication-User-Management.md)
- [Course Management](./03-Course-Instructor-Management.md)
- [Exam Management](./06-Exam-Management.md)
- [Complete API Reference](./API-Reference.md)

---

**Last Updated:** December 26, 2024
**Version:** 2.0
**Status:** ✅ Production Ready
