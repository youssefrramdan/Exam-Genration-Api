# Online Exam Platform API

A comprehensive RESTful API for managing an online examination system built with **Node.js**, **Express**, and **SQL Server**.

---

## 🚀 Features

- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **Role-Based Access Control** - Separate permissions for Students and Instructors
- ✅ **Branch & Track Management** - Organize educational programs
- ✅ **Course Management** - CRUD operations for courses
- ✅ **Question Bank** - MCQ and True/False questions
- ✅ **Auto Exam Generation** - Random question selection
- ✅ **Automatic Grading** - Instant exam correction
- ✅ **Student Enrollment** - Course assignment system
- ✅ **Comprehensive API** - 48 RESTful endpoints

---

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Security](#security)
- [Contributing](#contributing)

---

## 🛠️ Tech Stack

### Backend

- **Node.js** v18+
- **Express.js** v4.18+
- **mssql** v10+ (SQL Server driver)

### Authentication & Security

- **JWT** (jsonwebtoken)
- **bcrypt** (password hashing)
- **helmet** (security headers)
- **cors** (cross-origin resource sharing)
- **express-rate-limit** (rate limiting)

### Development Tools

- **nodemon** (auto-restart)
- **dotenv** (environment variables)

---

## 🏗️ Architecture

### Design Principles

- **Business Logic in Stored Procedures** - All database operations use SPs
- **Node.js as API Layer** - Thin controller layer
- **JWT-Based Authentication** - Stateless authentication
- **Role-Based Authorization** - Middleware-based access control

### Database Design

- **Students & Instructors** - Separate user tables
- **Branches & Tracks** - Educational program organization
- **Courses & Topics** - Course structure
- **Questions & Choices** - Question bank
- **Exams & Submissions** - Exam management
- **Enrollment & Grading** - Student progress tracking

---

## 📦 Installation

### Prerequisites

- Node.js v18 or higher
- SQL Server 2019 or higher
- npm or yarn

### Steps

1. **Clone the repository**

```bash
git clone <repository-url>
cd online-exam-platform
```

2. **Install dependencies**

```bash
npm install
```

3. **Create environment file**

```bash
cp .env.example .env
```

4. **Configure environment variables** (see [Configuration](#configuration))

5. **Set up database** (see [Database Setup](#database-setup))

---

## ⚙️ Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_SERVER=your-server-address
DB_DATABASE=your-database-name
DB_USER=your-username
DB_PASSWORD=your-password
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=true

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Security
BCRYPT_ROUNDS=10
```

---

## 🗄️ Database Setup

### 1. Create Database

```sql
CREATE DATABASE OnlineExamPlatform;
GO
USE OnlineExamPlatform;
```

### 2. Run SQL Scripts (in order)

Execute the following SQL files from the `database/` folder:

1. **Tables** (create all tables first)
2. **Stored Procedures:**
   - `sp_login.sql` - Authentication
   - `sp_add_user.sql` - User registration
   - `sp_branch.sql` - Branch management
   - `sp_track.sql` - Track management
   - `sp_course.sql` - Course management
   - `sp_instructor_courses.sql` - Instructor-course relations
   - `sp_student.sql` - Student management
   - `sp_question.sql` - Question management
   - `sp_exam.sql` - Exam management

### 3. Seed Test Data (Optional)

```sql
-- Add test instructor
EXEC sp_add_user_instructor
    @instructor_name = 'Dr. Mohamed Hassan',
    @instructor_email = 'instructor@example.com',
    @password = '$2b$10$hashedPasswordHere',
    @date_of_birth = '1980-01-01',
    @phone = '01234567890',
    @specialization = 'Computer Science';

-- Add test student
EXEC sp_add_user_student
    @student_name = 'Ahmed Ali',
    @student_email = 'student@example.com',
    @password = '$2b$10$hashedPasswordHere',
    @date_of_birth = '2000-01-01',
    @phone = '01098765432',
    @tr_id = 1;
```

---

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

### Test Database Connection

```bash
node scripts/test-connection.js
```

The server will start on `http://localhost:3000` (or your configured PORT).

---

## 📚 API Documentation

### Quick Links

- [Complete API Reference](./docs/API-Reference.md) - All 48 endpoints
- [Authentication & User Management](./docs/01-Authentication-User-Management.md)
- [Branch & Track Management](./docs/02-Branch-Track-Management.md)
- [Course & Instructor Management](./docs/03-Course-Instructor-Management.md)
- [Student Management](./docs/04-Student-Management.md)
- [Question Management](./docs/05-Question-Management.md)
- [Exam Management](./docs/06-Exam-Management.md)

### API Modules

| Module            | Endpoints | Description                     |
| ----------------- | --------- | ------------------------------- |
| Authentication    | 3         | Login, add users                |
| Branches          | 4         | CRUD operations                 |
| Tracks            | 4         | CRUD operations                 |
| Branch-Track      | 3         | Assign tracks to branches       |
| Courses           | 4         | CRUD operations                 |
| Instructor-Course | 8         | Assignments, topics             |
| Students          | 7         | Management, enrollment          |
| Questions         | 5         | Question bank management        |
| Exams             | 10        | Generation, submission, grading |
| **Total**         | **48**    |                                 |

### Base URL

```
http://localhost:3000/api
```

### Authentication

All protected endpoints require a Bearer token:

```bash
Authorization: Bearer <your-jwt-token>
```

---

## 🧪 Testing

### Using Postman

1. Import the collection:

   - File: `Online Exam Platform API.postman_collection.json`

2. Set environment variables:

   - `base_url`: `http://localhost:3000`
   - `token`: (auto-set after login)

3. Test workflow:
   - Login → Get token → Test protected endpoints

### Manual Testing

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "student@example.com", "password": "password123"}'

# Get courses (with token)
curl -X GET http://localhost:3000/api/courses \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📁 Project Structure

```
online-exam-platform/
├── src/
│   ├── config/
│   │   └── db.js                 # Database connection
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── branch.controller.js
│   │   ├── track.controller.js
│   │   ├── course.controller.js
│   │   ├── instructor-course.controller.js
│   │   ├── student.controller.js
│   │   ├── question.controller.js
│   │   └── exam.controller.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── branch.routes.js
│   │   ├── track.routes.js
│   │   ├── branch-track.routes.js
│   │   ├── course.routes.js
│   │   ├── instructor-course.routes.js
│   │   ├── student.routes.js
│   │   ├── question.routes.js
│   │   └── exam.routes.js
│   ├── middlewares/
│   │   └── auth.middleware.js    # JWT authentication & authorization
│   └── app.js                    # Express app configuration
├── database/
│   ├── sp_login.sql
│   ├── sp_add_user.sql
│   ├── sp_branch.sql
│   ├── sp_track.sql
│   ├── sp_course.sql
│   ├── sp_instructor_courses.sql
│   ├── sp_student.sql
│   ├── sp_question.sql
│   └── sp_exam.sql
├── docs/
│   ├── API-Reference.md
│   ├── 01-Authentication-User-Management.md
│   ├── 02-Branch-Track-Management.md
│   ├── 03-Course-Instructor-Management.md
│   ├── 04-Student-Management.md
│   ├── 05-Question-Management.md
│   └── 06-Exam-Management.md
├── server.js                     # Entry point
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

---

## 🔒 Security

### Implemented Security Features

1. **Password Security**

   - bcrypt hashing with salt rounds = 10
   - Passwords never stored in plain text

2. **JWT Authentication**

   - Secure token generation
   - 24-hour expiration
   - Role-based payload

3. **Rate Limiting**

   - Login: 5 requests per 15 minutes
   - Other auth endpoints: 10 requests per 15 minutes

4. **HTTP Security Headers**

   - Helmet.js for security headers
   - CORS configuration

5. **Input Validation**

   - Request body validation
   - SQL injection prevention (via parameterized SPs)

6. **Role-Based Access Control**
   - Middleware-based authorization
   - Case-insensitive role checking

---

## 🎯 Key Features Explained

### 1. Auto Exam Generation

- Randomly selects questions from course pool
- Supports MCQ and True/False questions
- Validates question availability before generation

### 2. Batch Answer Submission

- Students submit all answers in one request
- Reduces network overhead
- Partial success handling

### 3. Automatic Grading

- Instant correction after submission
- Question-by-question breakdown
- Final grade calculation

### 4. Flexible Question Formats

- Array format (separate choices array)
- Pivoted format (choice1, choice2, etc.)

### 5. Instructor's Own Courses

- Instructors view only assigned courses
- Course details with topics
- Enhanced course management

---

## 📊 API Usage Statistics

### By Role

**Student APIs:** 6 endpoints

- View courses, take exams, view results

**Instructor APIs:** 38 endpoints

- Full CRUD operations
- User management
- Exam creation and grading

**Shared APIs:** 4 endpoints

- View branches, tracks, courses
- View exam questions

---

## 🔄 Typical Workflows

### Student Workflow

```
1. Login
2. View enrolled courses
3. View available exams
4. Take exam (get questions)
5. Submit all answers
6. View results
7. View exam history
```

### Instructor Workflow

```
1. Login
2. Create/manage courses
3. Add questions to course
4. Generate exam
5. Assign grades to questions
6. Validate and finalize exam
7. View student submissions
```

---

## 🐛 Troubleshooting

### Common Issues

**1. Database Connection Error**

```
Error: Failed to connect to SQL Server
```

**Solution:** Check `.env` file and SQL Server credentials

**2. JWT Token Expired**

```
Error: Token has expired
```

**Solution:** Login again to get a new token

**3. Port Already in Use**

```
Error: EADDRINUSE :::3000
```

**Solution:** Change PORT in `.env` or kill the process using the port

**4. Rate Limit Exceeded**

```
Error: Too many requests
```

**Solution:** Wait 15 minutes or adjust rate limit in `app.js`

---

## 📝 Environment Variables

| Variable         | Description        | Example              |
| ---------------- | ------------------ | -------------------- |
| `PORT`           | Server port        | `3000`               |
| `NODE_ENV`       | Environment        | `development`        |
| `DB_SERVER`      | SQL Server address | `localhost`          |
| `DB_DATABASE`    | Database name      | `OnlineExamPlatform` |
| `DB_USER`        | Database username  | `sa`                 |
| `DB_PASSWORD`    | Database password  | `yourPassword`       |
| `JWT_SECRET`     | JWT signing key    | `your-secret-key`    |
| `JWT_EXPIRES_IN` | Token expiration   | `24h`                |

---

## 🚦 API Response Format

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

## 📈 Performance

- **Stored Procedures** - Optimized database queries
- **Connection Pooling** - Efficient database connections
- **JWT Stateless** - No server-side session storage
- **Batch Operations** - Reduced network overhead

---

## 🔮 Future Enhancements

- [ ] Email notifications
- [ ] File upload for questions (images)
- [ ] Real-time exam monitoring
- [ ] Analytics dashboard
- [ ] Export results to PDF/Excel
- [ ] Multi-language support
- [ ] Mobile app integration

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Contributors

- **Development Team** - Initial work and maintenance

---

## 📞 Support

For issues, questions, or contributions:

- Open an issue on GitHub
- Contact the development team
- Check the documentation in `/docs`

---

## 🎓 Academic Use

This project is designed for educational purposes and can be used as:

- Learning resource for Node.js and Express
- Reference for SQL Server integration
- Example of RESTful API design
- Study material for JWT authentication

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your settings

# 3. Set up database
# Run SQL scripts in database/ folder

# 4. Start server
npm run dev

# 5. Test API
curl http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

---

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [SQL Server Documentation](https://docs.microsoft.com/en-us/sql/)
- [JWT Introduction](https://jwt.io/introduction)
- [REST API Best Practices](https://restfulapi.net/)

---

**Last Updated:** December 26, 2024
**Version:** 2.0
**Status:** ✅ Production Ready

---

Made with ❤️ for Online Education
