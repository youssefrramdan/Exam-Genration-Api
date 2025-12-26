# Complete API Reference

## Overview

This document provides a complete reference for all APIs in the Online Exam Platform.

**Base URL:** `http://localhost:3000/api`
**Authentication:** Bearer Token (JWT)
**Content-Type:** `application/json`

---

## Table of Contents

1. [Authentication & User Management](#authentication--user-management)
2. [Branch Management](#branch-management)
3. [Track Management](#track-management)
4. [Branch-Track Relations](#branch-track-relations)
5. [Course Management](#course-management)
6. [Instructor-Course Management](#instructor-course-management)
7. [Student Management](#student-management)
8. [Question Management](#question-management)
9. [Exam Management](#exam-management)

---

## Authentication & User Management

### Login

- **POST** `/auth/login`
- **Access:** Public
- **Body:** `{ email, password }`

### Add Student

- **POST** `/auth/add-user/student`
- **Access:** Instructor
- **Body:** `{ name, email, password, dateOfBirth, phone, trackId }`

### Add Instructor

- **POST** `/auth/add-user/instructor`
- **Access:** Instructor
- **Body:** `{ name, email, password, dateOfBirth, phone, specialization }`

---

## Branch Management

### Get All Branches

- **GET** `/branches`
- **Access:** Authenticated

### Create Branch

- **POST** `/branches`
- **Access:** Instructor
- **Body:** `{ name, description }`

### Update Branch

- **PUT** `/branches/:id`
- **Access:** Instructor
- **Body:** `{ name, description }`

### Delete Branch

- **DELETE** `/branches/:id`
- **Access:** Instructor

---

## Track Management

### Get All Tracks

- **GET** `/tracks`
- **Access:** Authenticated

### Create Track

- **POST** `/tracks`
- **Access:** Instructor
- **Body:** `{ name, description }`

### Update Track

- **PUT** `/tracks/:id`
- **Access:** Instructor
- **Body:** `{ name, description }`

### Delete Track

- **DELETE** `/tracks/:id`
- **Access:** Instructor

---

## Branch-Track Relations

### Get All Relations

- **GET** `/branch-tracks`
- **Access:** Authenticated

### Assign Track to Branch

- **POST** `/branch-tracks`
- **Access:** Instructor
- **Body:** `{ branchId, trackId }`

### Remove Track from Branch

- **DELETE** `/branch-tracks/:branchId/:trackId`
- **Access:** Instructor

---

## Course Management

### Get All Courses

- **GET** `/courses`
- **Access:** Authenticated

### Create Course

- **POST** `/courses`
- **Access:** Instructor
- **Body:** `{ name, code, duration, trackId }`

### Update Course

- **PUT** `/courses/:id`
- **Access:** Instructor
- **Body:** `{ name, code, duration, trackId }`

### Delete Course

- **DELETE** `/courses/:id`
- **Access:** Instructor

---

## Instructor-Course Management

### Assign Instructor to Course

- **POST** `/instructor-course/assign`
- **Access:** Instructor
- **Body:** `{ instructorId, courseId }`

### Remove Instructor from Course

- **DELETE** `/instructor-course/assign/:instructorId/:courseId`
- **Access:** Instructor

### Add Course Topic

- **POST** `/instructor-course/topics`
- **Access:** Instructor
- **Body:** `{ courseId, topicName, topicOrder }`

### Get Course Topics

- **GET** `/instructor-course/topics/:courseId`
- **Access:** Instructor

### Delete Course Topic

- **DELETE** `/instructor-course/topics/:topicId`
- **Access:** Instructor

### Get My Courses (Instructor)

- **GET** `/instructor-course/my-courses`
- **Access:** Instructor

### Get My Course Details

- **GET** `/instructor-course/my-courses/:courseId`
- **Access:** Instructor

### Get My Courses with Topics

- **GET** `/instructor-course/my-courses-with-topics`
- **Access:** Instructor

---

## Student Management

### Get All Students (Instructor)

- **GET** `/students`
- **Access:** Instructor

### Update Student

- **PUT** `/students/:id`
- **Access:** Instructor
- **Body:** `{ name, email, dateOfBirth, trackId }`

### Delete Student

- **DELETE** `/students/:id`
- **Access:** Instructor

### Get Student Courses (by ID)

- **GET** `/students/courses/:id`
- **Access:** Instructor

### Assign Course to Student

- **POST** `/students/assign-course`
- **Access:** Instructor
- **Body:** `{ studentId, courseId }`

### Remove Course from Student

- **DELETE** `/students/assign-course/:studentId/:courseId`
- **Access:** Instructor

### Get My Courses (Student)

- **GET** `/students/courses`
- **Access:** Student

---

## Question Management

### Add Question

- **POST** `/questions`
- **Access:** Instructor
- **Body:** `{ questionText, questionType, correctAnswer, courseId, choice1, choice2, choice3, choice4 }`

### Get Question Details (Array Format)

- **GET** `/questions/:id`
- **Access:** Instructor

### Get Question Details (Pivoted Format)

- **GET** `/questions/:id/v2`
- **Access:** Instructor

### Update Question

- **PUT** `/questions/:id`
- **Access:** Instructor
- **Body:** `{ questionText, questionType, correctAnswer, courseId, choice1, choice2, choice3, choice4 }`

### Delete Question

- **DELETE** `/questions/:id`
- **Access:** Instructor

---

## Exam Management

### Instructor APIs

#### Generate Exam

- **POST** `/exams/generate`
- **Access:** Instructor
- **Body:** `{ title, type, duration, tfCount, mcqCount, examGrade, courseId }`

#### Get My Exams

- **GET** `/exams/instructor/my-exams`
- **Access:** Instructor

#### Assign Question Grade

- **POST** `/exams/assign-grade`
- **Access:** Instructor
- **Body:** `{ examId, questionId, questionGrade }`

#### Validate Exam Grade

- **GET** `/exams/:id/validate`
- **Access:** Instructor

#### Finalize Exam

- **POST** `/exams/:id/finalize`
- **Access:** Instructor

### Student APIs

#### Get Available Exams

- **GET** `/exams/student/available`
- **Access:** Student

#### Get My Taken Exams

- **GET** `/exams/student/my-exams`
- **Access:** Student

#### Submit All Answers

- **POST** `/exams/student/submit-answers`
- **Access:** Student
- **Body:** `{ examId, answers: [{ questionId, studentAnswer }] }`

#### Get Exam Results

- **GET** `/exams/student/:examId/correct`
- **Access:** Student

### Shared APIs

#### Get Exam Questions

- **GET** `/exams/:id/questions`
- **Access:** Instructor & Student

---

## API Summary by Role

### Public APIs (No Authentication)

- POST `/auth/login`

### Student APIs

- GET `/students/courses` - My courses
- GET `/exams/student/available` - Available exams
- GET `/exams/student/my-exams` - My taken exams
- GET `/exams/:id/questions` - Exam questions
- POST `/exams/student/submit-answers` - Submit answers
- GET `/exams/student/:examId/correct` - Get results

### Instructor APIs

- POST `/auth/add-user/student` - Add student
- POST `/auth/add-user/instructor` - Add instructor
- All Branch Management APIs
- All Track Management APIs
- All Branch-Track Relation APIs
- All Course Management APIs
- All Instructor-Course APIs
- All Student Management APIs (except student's own courses)
- All Question Management APIs
- All Exam Management APIs (instructor section)
- GET `/exams/:id/questions` - Exam questions

### Shared APIs (Both Roles)

- GET `/branches` - View branches
- GET `/tracks` - View tracks
- GET `/branch-tracks` - View relations
- GET `/courses` - View courses
- GET `/exams/:id/questions` - View exam questions

---

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "count": 10
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

---

## Status Codes

| Code | Meaning                                 |
| ---- | --------------------------------------- |
| 200  | OK - Success                            |
| 201  | Created - Resource created              |
| 400  | Bad Request - Invalid input             |
| 401  | Unauthorized - Invalid/missing token    |
| 403  | Forbidden - Insufficient permissions    |
| 404  | Not Found - Resource doesn't exist      |
| 409  | Conflict - Duplicate resource           |
| 429  | Too Many Requests - Rate limit exceeded |
| 500  | Internal Server Error                   |

---

## Authentication

### Getting a Token

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Ahmed Ali",
      "email": "user@example.com",
      "role": "Student"
    }
  }
}
```

### Using the Token

```bash
curl -X GET http://localhost:3000/api/students/courses \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Rate Limiting

| Endpoint            | Limit                      |
| ------------------- | -------------------------- |
| `/auth/login`       | 5 requests per 15 minutes  |
| Other `/auth/*`     | 10 requests per 15 minutes |
| All other endpoints | No limit (use responsibly) |

---

## Postman Collection

Import the provided Postman collection for easy API testing:

- File: `Online Exam Platform API.postman_collection.json`
- Variables: `base_url`, `token`, `exam_id`, `course_id`

---

## Quick Start Examples

### 1. Login as Student

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "student@example.com", "password": "pass123"}'
```

### 2. View My Courses

```bash
curl -X GET http://localhost:3000/api/students/courses \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Take an Exam

```bash
# Get available exams
curl -X GET http://localhost:3000/api/exams/student/available \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get questions
curl -X GET http://localhost:3000/api/exams/3/questions \
  -H "Authorization: Bearer YOUR_TOKEN"

# Submit answers
curl -X POST http://localhost:3000/api/exams/student/submit-answers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "examId": 3,
    "answers": [
      {"questionId": 159, "studentAnswer": "True"},
      {"questionId": 161, "studentAnswer": "Model is too simple"}
    ]
  }'

# Get results
curl -X GET http://localhost:3000/api/exams/student/3/correct \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Total API Count

| Module                 | APIs        |
| ---------------------- | ----------- |
| Authentication         | 3           |
| Branches               | 4           |
| Tracks                 | 4           |
| Branch-Track Relations | 3           |
| Courses                | 4           |
| Instructor-Course      | 8           |
| Students               | 7           |
| Questions              | 5           |
| Exams                  | 10          |
| **Total**              | **48 APIs** |

---

## Related Documentation

- [Authentication & User Management](./01-Authentication-User-Management.md)
- [Branch & Track Management](./02-Branch-Track-Management.md)
- [Course & Instructor Management](./03-Course-Instructor-Management.md)
- [Student Management](./04-Student-Management.md)
- [Question Management](./05-Question-Management.md)
- [Exam Management](./06-Exam-Management.md)

---

**Last Updated:** December 26, 2024
**Version:** 2.0
**Status:** ✅ Production Ready
