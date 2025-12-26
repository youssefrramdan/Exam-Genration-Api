# Authentication & User Management

## Overview

This module handles user authentication, registration, and JWT-based authorization for the Online Exam Platform. It supports two user types: **Students** and **Instructors**.

---

## Table of Contents

- [Features](#features)
- [Database Schema](#database-schema)
- [Stored Procedures](#stored-procedures)
- [API Endpoints](#api-endpoints)
- [Authentication Flow](#authentication-flow)
- [Security Features](#security-features)
- [Usage Examples](#usage-examples)

---

## Features

✅ **JWT Authentication** - Secure token-based authentication
✅ **Role-Based Access Control** - Separate permissions for Students and Instructors
✅ **Password Hashing** - bcrypt encryption for password security
✅ **User Registration** - Add new students and instructors
✅ **Login System** - Unified login for both user types
✅ **Active Status Check** - Only active users can login

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
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (tr_id) REFERENCES tracks(tr_id)
);
```

### Instructors Table

```sql
CREATE TABLE instructors (
    instructor_id INT PRIMARY KEY IDENTITY(1,1),
    instructor_name VARCHAR(100) NOT NULL,
    instructor_email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    phone VARCHAR(20),
    specialization VARCHAR(100),
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE()
);
```

---

## Stored Procedures

### 1. `sp_login` - User Login

**Purpose:** Authenticate users and return user details for JWT generation.

**Parameters:**

- `@email` (VARCHAR) - User email address

**Returns:**

- `user_id` - Unique user identifier
- `full_name` - User's full name
- `password` - Hashed password (for bcrypt comparison in Node.js)
- `role` - User role (Student or Instructor)
- `is_active` - Account status

**Logic:**

1. Search for email in `students` table
2. If not found, search in `instructors` table
3. Return user details with appropriate role
4. Password comparison is done in Node.js using bcrypt

**SQL:**

```sql
CREATE OR ALTER PROCEDURE sp_login
    @email VARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    -- Check Students table
    IF EXISTS (SELECT 1 FROM students WHERE student_email = @email)
    BEGIN
        SELECT
            student_id AS user_id,
            student_name AS full_name,
            password,
            'Student' AS role,
            is_active
        FROM students
        WHERE student_email = @email;
        RETURN;
    END

    -- Check Instructors table
    IF EXISTS (SELECT 1 FROM instructors WHERE instructor_email = @email)
    BEGIN
        SELECT
            instructor_id AS user_id,
            instructor_name AS full_name,
            password,
            'Instructor' AS role,
            is_active
        FROM instructors
        WHERE instructor_email = @email;
        RETURN;
    END

    -- User not found
    SELECT NULL AS user_id;
END;
```

---

### 2. `sp_add_user_student` - Add New Student

**Purpose:** Register a new student with hashed password.

**Parameters:**

- `@student_name` (VARCHAR) - Student's full name
- `@student_email` (VARCHAR) - Student's email (must be unique)
- `@password` (VARCHAR) - Hashed password from Node.js
- `@date_of_birth` (DATE) - Student's date of birth
- `@phone` (VARCHAR) - Phone number
- `@tr_id` (INT) - Track ID (foreign key)

**Returns:**

- `student_id` - New student ID
- Success/error message

**SQL:**

```sql
CREATE OR ALTER PROCEDURE sp_add_user_student
    @student_name VARCHAR(100),
    @student_email VARCHAR(100),
    @password VARCHAR(255),
    @date_of_birth DATE,
    @phone VARCHAR(20),
    @tr_id INT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Check if email already exists
        IF EXISTS (SELECT 1 FROM students WHERE student_email = @student_email)
        BEGIN
            SELECT 'Email already exists' AS message;
            ROLLBACK TRANSACTION;
            RETURN;
        END

        IF EXISTS (SELECT 1 FROM instructors WHERE instructor_email = @student_email)
        BEGIN
            SELECT 'Email already exists' AS message;
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Insert new student
        INSERT INTO students (
            student_name, student_email, password,
            date_of_birth, phone, tr_id, is_active
        )
        VALUES (
            @student_name, @student_email, @password,
            @date_of_birth, @phone, @tr_id, 1
        );

        DECLARE @student_id INT = SCOPE_IDENTITY();

        SELECT
            @student_id AS student_id,
            'Student registered successfully' AS message;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
```

---

### 3. `sp_add_user_instructor` - Add New Instructor

**Purpose:** Register a new instructor with hashed password.

**Parameters:**

- `@instructor_name` (VARCHAR) - Instructor's full name
- `@instructor_email` (VARCHAR) - Instructor's email (must be unique)
- `@password` (VARCHAR) - Hashed password from Node.js
- `@date_of_birth` (DATE) - Instructor's date of birth
- `@phone` (VARCHAR) - Phone number
- `@specialization` (VARCHAR) - Area of expertise

**Returns:**

- `instructor_id` - New instructor ID
- Success/error message

**SQL:**

```sql
CREATE OR ALTER PROCEDURE sp_add_user_instructor
    @instructor_name VARCHAR(100),
    @instructor_email VARCHAR(100),
    @password VARCHAR(255),
    @date_of_birth DATE,
    @phone VARCHAR(20),
    @specialization VARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Check if email already exists
        IF EXISTS (SELECT 1 FROM students WHERE student_email = @instructor_email)
        BEGIN
            SELECT 'Email already exists' AS message;
            ROLLBACK TRANSACTION;
            RETURN;
        END

        IF EXISTS (SELECT 1 FROM instructors WHERE instructor_email = @instructor_email)
        BEGIN
            SELECT 'Email already exists' AS message;
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Insert new instructor
        INSERT INTO instructors (
            instructor_name, instructor_email, password,
            date_of_birth, phone, specialization, is_active
        )
        VALUES (
            @instructor_name, @instructor_email, @password,
            @date_of_birth, @phone, @specialization, 1
        );

        DECLARE @instructor_id INT = SCOPE_IDENTITY();

        SELECT
            @instructor_id AS instructor_id,
            'Instructor registered successfully' AS message;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
```

---

## API Endpoints

### 1. Login

**Endpoint:** `POST /api/auth/login`
**Access:** Public
**Rate Limit:** 5 requests per 15 minutes

**Request Body:**

```json
{
  "email": "student@example.com",
  "password": "password123"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Ahmed Ali",
      "email": "student@example.com",
      "role": "Student"
    }
  }
}
```

**Error Responses:**

```json
// Invalid credentials (401)
{
  "success": false,
  "message": "Invalid email or password"
}

// Account inactive (403)
{
  "success": false,
  "message": "Account is inactive. Please contact administrator."
}

// Missing fields (400)
{
  "success": false,
  "message": "Please provide email and password"
}
```

---

### 2. Add Student

**Endpoint:** `POST /api/auth/add-user/student`
**Access:** Instructor only
**Authentication:** Required (Bearer Token)

**Request Body:**

```json
{
  "name": "Ahmed Ali",
  "email": "ahmed@example.com",
  "password": "securePassword123",
  "dateOfBirth": "2000-01-15",
  "phone": "01234567890",
  "trackId": 1
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Student registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 5,
      "name": "Ahmed Ali",
      "email": "ahmed@example.com",
      "role": "Student"
    }
  }
}
```

**Error Responses:**

```json
// Email exists (409)
{
  "success": false,
  "message": "Email already exists"
}

// Missing fields (400)
{
  "success": false,
  "message": "Please provide all required fields"
}
```

---

### 3. Add Instructor

**Endpoint:** `POST /api/auth/add-user/instructor`
**Access:** Instructor only
**Authentication:** Required (Bearer Token)

**Request Body:**

```json
{
  "name": "Dr. Mohamed Hassan",
  "email": "mohamed@example.com",
  "password": "securePassword123",
  "dateOfBirth": "1980-05-20",
  "phone": "01234567890",
  "specialization": "Computer Science"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Instructor registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 3,
      "name": "Dr. Mohamed Hassan",
      "email": "mohamed@example.com",
      "role": "Instructor"
    }
  }
}
```

---

## Authentication Flow

### Login Flow

```
1. User submits email + password
   ↓
2. Backend calls sp_login(@email)
   ↓
3. SP returns user data with hashed password
   ↓
4. Backend compares password using bcrypt.compare()
   ↓
5. If valid, check is_active status
   ↓
6. Generate JWT token with { userId, role }
   ↓
7. Return token + user data
```

### Registration Flow

```
1. Instructor submits new user data
   ↓
2. Backend validates input
   ↓
3. Backend hashes password using bcrypt
   ↓
4. Backend calls sp_add_user_student/instructor
   ↓
5. SP checks email uniqueness
   ↓
6. SP inserts new user
   ↓
7. Generate JWT token for new user
   ↓
8. Return token + user data
```

### Protected Route Access

```
1. Client sends request with Bearer token
   ↓
2. authenticate middleware verifies JWT
   ↓
3. Decoded token added to req.user
   ↓
4. authorize middleware checks role
   ↓
5. If authorized, proceed to controller
   ↓
6. Controller executes business logic
```

---

## Security Features

### Password Security

- **Hashing Algorithm:** bcrypt with salt rounds = 10
- **Storage:** Only hashed passwords stored in database
- **Comparison:** Done in Node.js, not in SQL

### JWT Configuration

```javascript
{
  payload: { userId, role },
  secret: process.env.JWT_SECRET,
  expiresIn: '24h'
}
```

### Rate Limiting

- **Login Endpoint:** 5 requests per 15 minutes per IP
- **Other Auth Endpoints:** 10 requests per 15 minutes per IP

### Middleware Chain

```javascript
authenticate → authorize([roles]) → controller
```

### Case-Insensitive Role Checking

```javascript
// Both "Student" and "student" are valid
authorize(["Student", "Instructor"]);
```

---

## Usage Examples

### Example 1: Student Login

**Request:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ahmed@example.com",
    "password": "password123"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJTdHVkZW50IiwiaWF0IjoxNjQwMDAwMDAwLCJleHAiOjE2NDAwODY0MDB9.xyz",
    "user": {
      "id": 1,
      "name": "Ahmed Ali",
      "email": "ahmed@example.com",
      "role": "Student"
    }
  }
}
```

---

### Example 2: Add New Student (Instructor)

**Request:**

```bash
curl -X POST http://localhost:3000/api/auth/add-user/student \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_INSTRUCTOR_TOKEN" \
  -d '{
    "name": "Sara Mohamed",
    "email": "sara@example.com",
    "password": "securePass123",
    "dateOfBirth": "2001-03-10",
    "phone": "01098765432",
    "trackId": 2
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Student registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 8,
      "name": "Sara Mohamed",
      "email": "sara@example.com",
      "role": "Student"
    }
  }
}
```

---

### Example 3: Using Token for Protected Routes

**Request:**

```bash
curl -X GET http://localhost:3000/api/students/courses \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**

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

## Error Handling

### Common Error Codes

| Status Code | Meaning               | Example                                      |
| ----------- | --------------------- | -------------------------------------------- |
| 400         | Bad Request           | Missing required fields                      |
| 401         | Unauthorized          | Invalid or expired token                     |
| 403         | Forbidden             | Insufficient permissions or inactive account |
| 409         | Conflict              | Email already exists                         |
| 429         | Too Many Requests     | Rate limit exceeded                          |
| 500         | Internal Server Error | Database or server error                     |

---

## Environment Variables

Required in `.env` file:

```env
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=10
```

---

## Testing

### Test Login

```sql
-- Create test student
EXEC sp_add_user_student
    @student_name = 'Test Student',
    @student_email = 'test@example.com',
    @password = '$2b$10$hashedPasswordHere',
    @date_of_birth = '2000-01-01',
    @phone = '01234567890',
    @tr_id = 1;

-- Test login
EXEC sp_login @email = 'test@example.com';
```

---

## Updates & Changes

### Recent Updates (December 2024)

1. ✅ **Renamed Signup to Add User** - More accurate terminology
2. ✅ **Added Track ID for Students** - Required field during registration
3. ✅ **Added Date of Birth for Instructors** - Additional profile information
4. ✅ **Case-Insensitive Role Checking** - Improved authorization middleware
5. ✅ **Enhanced Error Messages** - More descriptive error responses
6. ✅ **JWT Auto-Generation** - Token generated immediately after registration

---

## Related Documentation

- [Branch & Track Management](./02-Branch-Track-Management.md)
- [Course Management](./03-Course-Management.md)
- [Student Management](./04-Student-Management.md)
- [Question Management](./05-Question-Management.md)
- [Exam Management](./06-Exam-Management.md)
- [Complete API Reference](./API-Reference.md)

---

**Last Updated:** December 26, 2024
**Version:** 2.0
**Status:** ✅ Production Ready
