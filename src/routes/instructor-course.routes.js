import express from "express";
const router = express.Router();
import {
  getInstructorCourses,
  getInstructorCourseDetails,
  getInstructorCoursesWithTopics,
  assignInstructorToCourse,
  deassignInstructorFromCourse,
  addCourseTopic,
  deleteCourseTopic,
  assignInstructorToTrack,
} from "../controllers/instructor-course.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

// Get instructor's courses (current logged-in instructor)
router.get(
  "/my-courses",
  authenticate,
  authorize(["Instructor"]),
  getInstructorCourses
);

// Get instructor's course details
router.get(
  "/my-courses/:courseId",
  authenticate,
  authorize(["Instructor"]),
  getInstructorCourseDetails
);

// Get instructor's courses with topics
router.get(
  "/my-courses-with-topics",
  authenticate,
  authorize(["Instructor"]),
  getInstructorCoursesWithTopics
);

// All routes require Instructor role

// Assign instructor to course
router.post(
  "/assign-course",
  authenticate,
  authorize(["Instructor"]),
  assignInstructorToCourse
);

// Remove instructor from course
router.delete(
  "/assign-course/:instructorId/:courseId",
  authenticate,
  authorize(["Instructor"]),
  deassignInstructorFromCourse
);

// Add topic to course
router.post(
  "/course-topic",
  authenticate,
  authorize(["Instructor"]),
  addCourseTopic
);

// Remove topic from course
router.delete(
  "/course-topic/:courseId/:topicName",
  authenticate,
  authorize(["Instructor"]),
  deleteCourseTopic
);

// Assign instructor to track
router.post(
  "/assign-track",
  authenticate,
  authorize(["Instructor"]),
  assignInstructorToTrack
);

export default router;
