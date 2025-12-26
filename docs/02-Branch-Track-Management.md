# Branch & Track Management

## Overview

This module manages educational branches, tracks, and their relationships in the Online Exam Platform. It provides CRUD operations for branches and tracks, along with the ability to assign tracks to branches.

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

✅ **Branch Management** - Create, read, update, and delete branches
✅ **Track Management** - Create, read, update, and delete tracks
✅ **Branch-Track Relations** - Assign tracks to branches
✅ **Cascade Delete** - Automatic cleanup of related data
✅ **Validation** - Prevent duplicate names and invalid operations

---

## Database Schema

### Branches Table

```sql
CREATE TABLE branches (
    br_id INT PRIMARY KEY IDENTITY(1,1),
    br_name VARCHAR(100) NOT NULL UNIQUE,
    br_desc VARCHAR(255),
    created_at DATETIME DEFAULT GETDATE()
);
```

### Tracks Table

```sql
CREATE TABLE tracks (
    tr_id INT PRIMARY KEY IDENTITY(1,1),
    tr_name VARCHAR(100) NOT NULL UNIQUE,
    tr_desc VARCHAR(255),
    created_at DATETIME DEFAULT GETDATE()
);
```

### Branch_Track Table (Junction Table)

```sql
CREATE TABLE branch_track (
    br_id INT NOT NULL,
    tr_id INT NOT NULL,
    PRIMARY KEY (br_id, tr_id),
    FOREIGN KEY (br_id) REFERENCES branches(br_id) ON DELETE CASCADE,
    FOREIGN KEY (tr_id) REFERENCES tracks(tr_id) ON DELETE CASCADE
);
```

---

## Stored Procedures

### Branch Management

#### 1. `sp_branch_insert` - Create Branch

```sql
CREATE OR ALTER PROCEDURE sp_branch_insert
    @br_name VARCHAR(100),
    @br_desc VARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM branches WHERE br_name = @br_name)
    BEGIN
        SELECT 'Branch name already exists' AS message;
        RETURN;
    END

    INSERT INTO branches (br_name, br_desc)
    VALUES (@br_name, @br_desc);

    SELECT
        SCOPE_IDENTITY() AS br_id,
        'Branch created successfully' AS message;
END;
```

#### 2. `sp_branch_select` - Get All Branches

```sql
CREATE OR ALTER PROCEDURE sp_branch_select
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        br_id,
        br_name,
        br_desc,
        created_at
    FROM branches
    ORDER BY br_name;
END;
```

#### 3. `sp_branch_update` - Update Branch

```sql
CREATE OR ALTER PROCEDURE sp_branch_update
    @br_id INT,
    @br_name VARCHAR(100),
    @br_desc VARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM branches WHERE br_id = @br_id)
    BEGIN
        SELECT 'Branch not found' AS message;
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM branches WHERE br_name = @br_name AND br_id != @br_id)
    BEGIN
        SELECT 'Branch name already exists' AS message;
        RETURN;
    END

    UPDATE branches
    SET br_name = @br_name,
        br_desc = @br_desc
    WHERE br_id = @br_id;

    SELECT 'Branch updated successfully' AS message;
END;
```

#### 4. `sp_branch_delete` - Delete Branch

```sql
CREATE OR ALTER PROCEDURE sp_branch_delete
    @br_id INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM branches WHERE br_id = @br_id)
    BEGIN
        SELECT 'Branch not found' AS message;
        RETURN;
    END

    DELETE FROM branches WHERE br_id = @br_id;

    SELECT 'Branch deleted successfully' AS message;
END;
```

---

### Track Management

#### 5. `sp_track_insert` - Create Track

```sql
CREATE OR ALTER PROCEDURE sp_track_insert
    @tr_name VARCHAR(100),
    @tr_desc VARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM tracks WHERE tr_name = @tr_name)
    BEGIN
        SELECT 'Track name already exists' AS message;
        RETURN;
    END

    INSERT INTO tracks (tr_name, tr_desc)
    VALUES (@tr_name, @tr_desc);

    SELECT
        SCOPE_IDENTITY() AS tr_id,
        'Track created successfully' AS message;
END;
```

#### 6. `sp_track_select` - Get All Tracks

```sql
CREATE OR ALTER PROCEDURE sp_track_select
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        tr_id,
        tr_name,
        tr_desc,
        created_at
    FROM tracks
    ORDER BY tr_name;
END;
```

#### 7. `sp_track_update` - Update Track

```sql
CREATE OR ALTER PROCEDURE sp_track_update
    @tr_id INT,
    @tr_name VARCHAR(100),
    @tr_desc VARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM tracks WHERE tr_id = @tr_id)
    BEGIN
        SELECT 'Track not found' AS message;
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM tracks WHERE tr_name = @tr_name AND tr_id != @tr_id)
    BEGIN
        SELECT 'Track name already exists' AS message;
        RETURN;
    END

    UPDATE tracks
    SET tr_name = @tr_name,
        tr_desc = @tr_desc
    WHERE tr_id = @tr_id;

    SELECT 'Track updated successfully' AS message;
END;
```

#### 8. `sp_track_delete` - Delete Track

```sql
CREATE OR ALTER PROCEDURE sp_track_delete
    @tr_id INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM tracks WHERE tr_id = @tr_id)
    BEGIN
        SELECT 'Track not found' AS message;
        RETURN;
    END

    DELETE FROM tracks WHERE tr_id = @tr_id;

    SELECT 'Track deleted successfully' AS message;
END;
```

---

### Branch-Track Relations

#### 9. `sp_branch_track_insert` - Assign Track to Branch

```sql
CREATE OR ALTER PROCEDURE sp_branch_track_insert
    @br_id INT,
    @tr_id INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM branches WHERE br_id = @br_id)
    BEGIN
        SELECT 'Branch not found' AS message;
        RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM tracks WHERE tr_id = @tr_id)
    BEGIN
        SELECT 'Track not found' AS message;
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM branch_track WHERE br_id = @br_id AND tr_id = @tr_id)
    BEGIN
        SELECT 'Track already assigned to this branch' AS message;
        RETURN;
    END

    INSERT INTO branch_track (br_id, tr_id)
    VALUES (@br_id, @tr_id);

    SELECT 'Track assigned to branch successfully' AS message;
END;
```

#### 10. `sp_branch_track_select` - Get All Branch-Track Relations

```sql
CREATE OR ALTER PROCEDURE sp_branch_track_select
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        bt.br_id,
        b.br_name,
        bt.tr_id,
        t.tr_name
    FROM branch_track bt
    INNER JOIN branches b ON bt.br_id = b.br_id
    INNER JOIN tracks t ON bt.tr_id = t.tr_id
    ORDER BY b.br_name, t.tr_name;
END;
```

#### 11. `sp_branch_track_delete` - Remove Track from Branch

```sql
CREATE OR ALTER PROCEDURE sp_branch_track_delete
    @br_id INT,
    @tr_id INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM branch_track WHERE br_id = @br_id AND tr_id = @tr_id)
    BEGIN
        SELECT 'Relation not found' AS message;
        RETURN;
    END

    DELETE FROM branch_track
    WHERE br_id = @br_id AND tr_id = @tr_id;

    SELECT 'Track removed from branch successfully' AS message;
END;
```

---

## API Endpoints

### Branch APIs

#### 1. Create Branch

**Endpoint:** `POST /api/branches`
**Access:** Instructor only
**Authentication:** Required

**Request:**

```json
{
  "name": "Computer Science",
  "description": "Software development and programming"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Branch created successfully",
  "data": {
    "id": 1,
    "name": "Computer Science",
    "description": "Software development and programming"
  }
}
```

---

#### 2. Get All Branches

**Endpoint:** `GET /api/branches`
**Access:** Authenticated users
**Authentication:** Required

**Response (200):**

```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": 1,
      "name": "Computer Science",
      "description": "Software development and programming",
      "createdAt": "2024-01-15T10:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Information Systems",
      "description": "Business and IT integration",
      "createdAt": "2024-01-16T10:00:00.000Z"
    }
  ]
}
```

---

#### 3. Update Branch

**Endpoint:** `PUT /api/branches/:id`
**Access:** Instructor only
**Authentication:** Required

**Request:**

```json
{
  "name": "Computer Science & AI",
  "description": "Software development, AI, and Machine Learning"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Branch updated successfully"
}
```

---

#### 4. Delete Branch

**Endpoint:** `DELETE /api/branches/:id`
**Access:** Instructor only
**Authentication:** Required

**Response (200):**

```json
{
  "success": true,
  "message": "Branch deleted successfully"
}
```

---

### Track APIs

#### 5. Create Track

**Endpoint:** `POST /api/tracks`
**Access:** Instructor only
**Authentication:** Required

**Request:**

```json
{
  "name": "Full Stack Development",
  "description": "Frontend and Backend development"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Track created successfully",
  "data": {
    "id": 1,
    "name": "Full Stack Development",
    "description": "Frontend and Backend development"
  }
}
```

---

#### 6. Get All Tracks

**Endpoint:** `GET /api/tracks`
**Access:** Authenticated users
**Authentication:** Required

**Response (200):**

```json
{
  "success": true,
  "count": 4,
  "data": [
    {
      "id": 1,
      "name": "Full Stack Development",
      "description": "Frontend and Backend development",
      "createdAt": "2024-01-15T10:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Data Science",
      "description": "Analytics and Machine Learning",
      "createdAt": "2024-01-16T10:00:00.000Z"
    }
  ]
}
```

---

#### 7. Update Track

**Endpoint:** `PUT /api/tracks/:id`
**Access:** Instructor only
**Authentication:** Required

**Request:**

```json
{
  "name": "Full Stack Web Development",
  "description": "Modern web development with React and Node.js"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Track updated successfully"
}
```

---

#### 8. Delete Track

**Endpoint:** `DELETE /api/tracks/:id`
**Access:** Instructor only
**Authentication:** Required

**Response (200):**

```json
{
  "success": true,
  "message": "Track deleted successfully"
}
```

---

### Branch-Track Relation APIs

#### 9. Assign Track to Branch

**Endpoint:** `POST /api/branch-tracks`
**Access:** Instructor only
**Authentication:** Required

**Request:**

```json
{
  "branchId": 1,
  "trackId": 2
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Track assigned to branch successfully",
  "data": {
    "branchId": 1,
    "trackId": 2
  }
}
```

---

#### 10. Get All Branch-Track Relations

**Endpoint:** `GET /api/branch-tracks`
**Access:** Authenticated users
**Authentication:** Required

**Response (200):**

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "branchId": 1,
      "branchName": "Computer Science",
      "trackId": 1,
      "trackName": "Full Stack Development"
    },
    {
      "branchId": 1,
      "branchName": "Computer Science",
      "trackId": 2,
      "trackName": "Data Science"
    }
  ]
}
```

---

#### 11. Remove Track from Branch

**Endpoint:** `DELETE /api/branch-tracks/:branchId/:trackId`
**Access:** Instructor only
**Authentication:** Required

**Response (200):**

```json
{
  "success": true,
  "message": "Track removed from branch successfully"
}
```

---

## Usage Examples

### Example 1: Create Complete Branch Structure

```bash
# Step 1: Create Branch
curl -X POST http://localhost:3000/api/branches \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Computer Science",
    "description": "Software and AI"
  }'

# Step 2: Create Tracks
curl -X POST http://localhost:3000/api/tracks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Full Stack Development",
    "description": "Web development"
  }'

curl -X POST http://localhost:3000/api/tracks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Data Science",
    "description": "ML and Analytics"
  }'

# Step 3: Assign Tracks to Branch
curl -X POST http://localhost:3000/api/branch-tracks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "branchId": 1,
    "trackId": 1
  }'

curl -X POST http://localhost:3000/api/branch-tracks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "branchId": 1,
    "trackId": 2
  }'
```

---

### Example 2: View All Relations

```bash
curl -X GET http://localhost:3000/api/branch-tracks \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "branchId": 1,
      "branchName": "Computer Science",
      "trackId": 1,
      "trackName": "Full Stack Development"
    },
    {
      "branchId": 1,
      "branchName": "Computer Science",
      "trackId": 2,
      "trackName": "Data Science"
    }
  ]
}
```

---

## Business Rules

### Validation Rules

1. **Unique Names**

   - Branch names must be unique
   - Track names must be unique

2. **Cascade Delete**

   - Deleting a branch removes all its track assignments
   - Deleting a track removes all its branch assignments

3. **Duplicate Prevention**

   - Cannot assign the same track to a branch twice

4. **Foreign Key Validation**
   - Branch must exist before assigning tracks
   - Track must exist before assignment

---

## Error Handling

| Status Code | Meaning      | Example                         |
| ----------- | ------------ | ------------------------------- |
| 400         | Bad Request  | Missing required fields         |
| 401         | Unauthorized | Invalid or missing token        |
| 403         | Forbidden    | Student trying to create branch |
| 404         | Not Found    | Branch or track doesn't exist   |
| 409         | Conflict     | Duplicate name or relation      |
| 500         | Server Error | Database error                  |

---

## Updates & Changes

### Recent Updates (December 2024)

1. ✅ **Enhanced Validation** - Better error messages
2. ✅ **Cascade Delete** - Automatic cleanup of relations
3. ✅ **Unique Constraints** - Prevent duplicate names
4. ✅ **Improved API Responses** - Consistent response format
5. ✅ **Role-Based Access** - Instructor-only write operations

---

## Related Documentation

- [Authentication & User Management](./01-Authentication-User-Management.md)
- [Course Management](./03-Course-Management.md)
- [Student Management](./04-Student-Management.md)
- [Complete API Reference](./API-Reference.md)

---

**Last Updated:** December 26, 2024
**Version:** 2.0
**Status:** ✅ Production Ready
