# Course & Instructor Management

## Overview

This module manages courses, instructor-course assignments, course topics, and instructor-track assignments in the Online Exam Platform. It provides comprehensive CRUD operations and relationship management.

---

## Table of Contents

- [Features](#features)
- [Database Schema](#database-schema)
- [Stored Procedures](#stored-procedures)
- [API Endpoints](#api-endpoints)
- [Usage Examples](#usage-examples)
- [Business Rules](#business-rules)

---

## Features

✅ **Course Management** - Create, read, update, and delete courses
✅ **Instructor-Course Assignment** - Assign instructors to courses
✅ **Course Topics** - Manage course topics/modules
✅ **Instructor-Track Assignment** - Assign instructors to tracks
✅ **Instructor's Own Courses** - View assigned courses with details
✅ **Cascade Delete** - Automatic cleanup of related data

---

## Database Schema

### Courses Table

```sql
CREATE TABLE courses (
    course_id INT PRIMARY KEY IDENTITY(1,1),
    course_name VARCHAR(100) NOT NULL,
    course_code VARCHAR(20) UNIQUE NOT NULL,
    duration INT, -- in hours
    tr_id INT,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (tr_id) REFERENCES tracks(tr_id)
);
```

### Instructor_Course Table

```sql
CREATE TABLE instructor_course (
    instructor_id INT NOT NULL,
    course_id INT NOT NULL,
    PRIMARY KEY (instructor_id, course_id),
    FOREIGN KEY (instructor_id) REFERENCES instructors(instructor_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
);
```

### Course_Topics Table

```sql
CREATE TABLE course_topics (
    topic_id INT PRIMARY KEY IDENTITY(1,1),
    course_id INT NOT NULL,
    topic_name VARCHAR(200) NOT NULL,
    topic_order INT,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
);
```

### Instructor_Track Table

```sql
CREATE TABLE instructor_track (
    instructor_id INT NOT NULL,
    tr_id INT NOT NULL,
    PRIMARY KEY (instructor_id, tr_id),
    FOREIGN KEY (instructor_id) REFERENCES instructors(instructor_id) ON DELETE CASCADE,
    FOREIGN KEY (tr_id) REFERENCES tracks(tr_id) ON DELETE CASCADE
);
```

---

## Stored Procedures

### Course Management

#### 1. `sp_insert_course` - Create Course

```sql
CREATE OR ALTER PROCEDURE sp_insert_course
    @course_name VARCHAR(100),
    @course_code VARCHAR(20),
    @duration INT,
    @tr_id INT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM courses WHERE course_code = @course_code)
    BEGIN
        SELECT 'Course code already exists' AS message;
        RETURN;
    END

    INSERT INTO courses (course_name, course_code, duration, tr_id)
    VALUES (@course_name, @course_code, @duration, @tr_id);

    SELECT
        SCOPE_IDENTITY() AS course_id,
        'Course created successfully' AS message;
END;
```

#### 2. `sp_select_courses` - Get All Courses

```sql
CREATE OR ALTER PROCEDURE sp_select_courses
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        c.course_id,
        c.course_name,
        c.course_code,
        c.duration,
        t.tr_name,
        c.created_at
    FROM courses c
    LEFT JOIN tracks t ON c.tr_id = t.tr_id
    ORDER BY c.course_name;
END;
```

#### 3. `sp_update_course` - Update Course

```sql
CREATE OR ALTER PROCEDURE sp_update_course
    @course_id INT,
    @course_name VARCHAR(100),
    @course_code VARCHAR(20),
    @duration INT,
    @tr_id INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM courses WHERE course_id = @course_id)
    BEGIN
        SELECT 'Course not found' AS message;
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM courses WHERE course_code = @course_code AND course_id != @course_id)
    BEGIN
        SELECT 'Course code already exists' AS message;
        RETURN;
    END

    UPDATE courses
    SET course_name = @course_name,
        course_code = @course_code,
        duration = @duration,
        tr_id = @tr_id
    WHERE course_id = @course_id;

    SELECT 'Course updated successfully' AS message;
END;
```

#### 4. `sp_delete_course` - Delete Course

```sql
CREATE OR ALTER PROCEDURE sp_delete_course
    @course_id INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM courses WHERE course_id = @course_id)
    BEGIN
        SELECT 'Course not found' AS message;
        RETURN;
    END

    DELETE FROM courses WHERE course_id = @course_id;

    SELECT 'Course deleted successfully' AS message;
END;
```

---

### Instructor-Course Assignment

#### 5. `sp_assign_instructor_to_course` - Assign Instructor

```sql
CREATE OR ALTER PROCEDURE sp_assign_instructor_to_course
    @instructor_id INT,
    @course_id INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM instructors WHERE instructor_id = @instructor_id)
    BEGIN
        SELECT 'Instructor not found' AS message;
        RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM courses WHERE course_id = @course_id)
    BEGIN
        SELECT 'Course not found' AS message;
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM instructor_course WHERE instructor_id = @instructor_id AND course_id = @course_id)
    BEGIN
        SELECT 'Instructor already assigned to this course' AS message;
        RETURN;
    END

    INSERT INTO instructor_course (instructor_id, course_id)
    VALUES (@instructor_id, @course_id);

    SELECT 'Instructor assigned to course successfully' AS message;
END;
```

#### 6. `sp_remove_instructor_from_course` - Remove Assignment

```sql
CREATE OR ALTER PROCEDURE sp_remove_instructor_from_course
    @instructor_id INT,
    @course_id INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM instructor_course WHERE instructor_id = @instructor_id AND course_id = @course_id)
    BEGIN
        SELECT 'Assignment not found' AS message;
        RETURN;
    END

    DELETE FROM instructor_course
    WHERE instructor_id = @instructor_id AND course_id = @course_id;

    SELECT 'Instructor removed from course successfully' AS message;
END;
```

---

### Course Topics Management

#### 7. `sp_add_course_topic` - Add Topic

```sql
CREATE OR ALTER PROCEDURE sp_add_course_topic
    @course_id INT,
    @topic_name VARCHAR(200),
    @topic_order INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM courses WHERE course_id = @course_id)
    BEGIN
        SELECT 'Course not found' AS message;
        RETURN;
    END

    INSERT INTO course_topics (course_id, topic_name, topic_order)
    VALUES (@course_id, @topic_name, @topic_order);

    SELECT
        SCOPE_IDENTITY() AS topic_id,
        'Topic added successfully' AS message;
END;
```

#### 8. `sp_get_course_topics` - Get Course Topics

```sql
CREATE OR ALTER PROCEDURE sp_get_course_topics
    @course_id INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        topic_id,
        topic_name,
        topic_order
    FROM course_topics
    WHERE course_id = @course_id
    ORDER BY topic_order;
END;
```

#### 9. `sp_delete_course_topic` - Delete Topic

```sql
CREATE OR ALTER PROCEDURE sp_delete_course_topic
    @topic_id INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM course_topics WHERE topic_id = @topic_id)
    BEGIN
        SELECT 'Topic not found' AS message;
        RETURN;
    END

    DELETE FROM course_topics WHERE topic_id = @topic_id;

    SELECT 'Topic deleted successfully' AS message;
END;
```

---

### Instructor's Own Courses

#### 10. `sp_get_instructor_courses` - Get Instructor's Courses

```sql
CREATE OR ALTER PROCEDURE sp_get_instructor_courses
    @instructor_id INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        c.course_id,
        c.course_name,
        c.course_code,
        c.duration,
        t.tr_name
    FROM instructor_course ic
    INNER JOIN courses c ON ic.course_id = c.course_id
    LEFT JOIN tracks t ON c.tr_id = t.tr_id
    WHERE ic.instructor_id = @instructor_id
    ORDER BY c.course_name;
END;
```

#### 11. `sp_get_instructor_course_details` - Get Course Details

```sql
CREATE OR ALTER PROCEDURE sp_get_instructor_course_details
    @instructor_id INT,
    @course_id INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM instructor_course WHERE instructor_id = @instructor_id AND course_id = @course_id)
    BEGIN
        SELECT 'You are not assigned to this course' AS message;
        RETURN;
    END

    SELECT
        c.course_id,
        c.course_name,
        c.course_code,
        c.duration,
        t.tr_name,
        c.created_at
    FROM courses c
    LEFT JOIN tracks t ON c.tr_id = t.tr_id
    WHERE c.course_id = @course_id;
END;
```

#### 12. `sp_get_instructor_courses_with_topics` - Get Courses with Topics

```sql
CREATE OR ALTER PROCEDURE sp_get_instructor_courses_with_topics
    @instructor_id INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        c.course_id,
        c.course_name,
        c.course_code,
        c.duration,
        t.tr_name,
        ct.topic_id,
        ct.topic_name,
        ct.topic_order
    FROM instructor_course ic
    INNER JOIN courses c ON ic.course_id = c.course_id
    LEFT JOIN tracks t ON c.tr_id = t.tr_id
    LEFT JOIN course_topics ct ON c.course_id = ct.course_id
    WHERE ic.instructor_id = @instructor_id
    ORDER BY c.course_name, ct.topic_order;
END;
```

---

## API Endpoints

### Course APIs

#### 1. Create Course

**Endpoint:** `POST /api/courses`
**Access:** Instructor only
**Authentication:** Required

**Request:**

```json
{
  "name": "Database Systems",
  "code": "CS301",
  "duration": 45,
  "trackId": 1
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Course created successfully",
  "data": {
    "id": 1,
    "name": "Database Systems",
    "code": "CS301",
    "duration": 45,
    "trackId": 1
  }
}
```

---

#### 2. Get All Courses

**Endpoint:** `GET /api/courses`
**Access:** Authenticated users
**Authentication:** Required

**Response (200):**

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 1,
      "name": "Database Systems",
      "code": "CS301",
      "duration": 45,
      "trackName": "Full Stack Development",
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

---

#### 3. Update Course

**Endpoint:** `PUT /api/courses/:id`
**Access:** Instructor only
**Authentication:** Required

**Request:**

```json
{
  "name": "Advanced Database Systems",
  "code": "CS301",
  "duration": 60,
  "trackId": 1
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Course updated successfully"
}
```

---

#### 4. Delete Course

**Endpoint:** `DELETE /api/courses/:id`
**Access:** Instructor only
**Authentication:** Required

**Response (200):**

```json
{
  "success": true,
  "message": "Course deleted successfully"
}
```

---

### Instructor-Course Assignment APIs

#### 5. Assign Instructor to Course

**Endpoint:** `POST /api/instructor-course/assign`
**Access:** Instructor only
**Authentication:** Required

**Request:**

```json
{
  "instructorId": 2,
  "courseId": 1
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Instructor assigned to course successfully",
  "data": {
    "instructorId": 2,
    "courseId": 1
  }
}
```

---

#### 6. Remove Instructor from Course

**Endpoint:** `DELETE /api/instructor-course/assign/:instructorId/:courseId`
**Access:** Instructor only
**Authentication:** Required

**Response (200):**

```json
{
  "success": true,
  "message": "Instructor removed from course successfully"
}
```

---

### Course Topics APIs

#### 7. Add Course Topic

**Endpoint:** `POST /api/instructor-course/topics`
**Access:** Instructor only
**Authentication:** Required

**Request:**

```json
{
  "courseId": 1,
  "topicName": "SQL Fundamentals",
  "topicOrder": 1
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Topic added successfully",
  "data": {
    "id": 1,
    "courseId": 1,
    "topicName": "SQL Fundamentals",
    "topicOrder": 1
  }
}
```

---

#### 8. Get Course Topics

**Endpoint:** `GET /api/instructor-course/topics/:courseId`
**Access:** Instructor only
**Authentication:** Required

**Response (200):**

```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": 1,
      "topicName": "SQL Fundamentals",
      "topicOrder": 1
    },
    {
      "id": 2,
      "topicName": "Database Design",
      "topicOrder": 2
    }
  ]
}
```

---

#### 9. Delete Course Topic

**Endpoint:** `DELETE /api/instructor-course/topics/:topicId`
**Access:** Instructor only
**Authentication:** Required

**Response (200):**

```json
{
  "success": true,
  "message": "Topic deleted successfully"
}
```

---

### Instructor's Own Courses APIs

#### 10. Get My Courses

**Endpoint:** `GET /api/instructor-course/my-courses`
**Access:** Instructor only
**Authentication:** Required

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
      "trackName": "Full Stack Development"
    }
  ]
}
```

---

#### 11. Get My Course Details

**Endpoint:** `GET /api/instructor-course/my-courses/:courseId`
**Access:** Instructor only
**Authentication:** Required

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Database Systems",
    "code": "CS301",
    "duration": 45,
    "trackName": "Full Stack Development",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

---

#### 12. Get My Courses with Topics

**Endpoint:** `GET /api/instructor-course/my-courses-with-topics`
**Access:** Instructor only
**Authentication:** Required

**Response (200):**

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "name": "Database Systems",
      "code": "CS301",
      "duration": 45,
      "trackName": "Full Stack Development",
      "topics": [
        {
          "id": 1,
          "name": "SQL Fundamentals",
          "order": 1
        },
        {
          "id": 2,
          "name": "Database Design",
          "order": 2
        }
      ]
    }
  ]
}
```

---

## Usage Examples

### Example 1: Create Course and Assign Instructor

```bash
# Step 1: Create Course
curl -X POST http://localhost:3000/api/courses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Database Systems",
    "code": "CS301",
    "duration": 45,
    "trackId": 1
  }'

# Step 2: Assign Instructor
curl -X POST http://localhost:3000/api/instructor-course/assign \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "instructorId": 2,
    "courseId": 1
  }'

# Step 3: Add Topics
curl -X POST http://localhost:3000/api/instructor-course/topics \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": 1,
    "topicName": "SQL Fundamentals",
    "topicOrder": 1
  }'
```

---

### Example 2: Instructor Views Own Courses

```bash
# Get all my courses
curl -X GET http://localhost:3000/api/instructor-course/my-courses \
  -H "Authorization: Bearer YOUR_INSTRUCTOR_TOKEN"

# Get specific course details
curl -X GET http://localhost:3000/api/instructor-course/my-courses/1 \
  -H "Authorization: Bearer YOUR_INSTRUCTOR_TOKEN"

# Get courses with topics
curl -X GET http://localhost:3000/api/instructor-course/my-courses-with-topics \
  -H "Authorization: Bearer YOUR_INSTRUCTOR_TOKEN"
```

---

## Business Rules

### Validation Rules

1. **Unique Course Codes** - Course codes must be unique across the system
2. **Instructor Verification** - Only existing instructors can be assigned
3. **Course Verification** - Only existing courses can have assignments
4. **Duplicate Prevention** - Cannot assign same instructor to same course twice
5. **Topic Ordering** - Topics are ordered sequentially per course
6. **Access Control** - Instructors can only view their assigned courses

---

## Updates & Changes

### Recent Updates (December 2024)

1. ✅ **Instructor's Own Courses** - New APIs for instructors to view their courses
2. ✅ **Course Topics Management** - Add and manage course topics
3. ✅ **Enhanced Course Details** - Detailed course information with topics
4. ✅ **Improved Validation** - Better error handling and messages
5. ✅ **Cascade Delete** - Automatic cleanup of related data

---

## Related Documentation

- [Authentication & User Management](./01-Authentication-User-Management.md)
- [Branch & Track Management](./02-Branch-Track-Management.md)
- [Student Management](./04-Student-Management.md)
- [Question Management](./05-Question-Management.md)
- [Exam Management](./06-Exam-Management.md)
- [Complete API Reference](./API-Reference.md)

---

**Last Updated:** December 26, 2024
**Version:** 2.0
**Status:** ✅ Production Ready
