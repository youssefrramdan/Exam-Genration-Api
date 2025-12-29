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
import { protectedRoutes, allowTo } from "../middlewares/auth.middleware.js";

// Get instructor's courses (current logged-in instructor)
router.get(
  "/my-courses",
  protectedRoutes,
  allowTo("Instructor"),
  getInstructorCourses
);

// Get instructor's course details
router.get(
  "/my-courses/:courseId",
  protectedRoutes,
  allowTo("Instructor"),
  getInstructorCourseDetails
);

// Get instructor's courses with topics
router.get(
  "/my-courses-with-topics",
  protectedRoutes,
  allowTo("Instructor"),
  getInstructorCoursesWithTopics
);

// All routes require Instructor role

// Assign instructor to course
router.post(
  "/assign-course",
  protectedRoutes,
  allowTo("Instructor"),
  assignInstructorToCourse
);

// Remove instructor from course
router.delete(
  "/assign-course/:instructorId/:courseId",
  protectedRoutes,
  allowTo("Instructor"),
  deassignInstructorFromCourse
);

// Add topic to course
router.post(
  "/course-topic",
  protectedRoutes,
  allowTo("Instructor"),
  addCourseTopic
);

// Remove topic from course
router.delete(
  "/course-topic/:courseId/:topicName",
  protectedRoutes,
  allowTo("Instructor"),
  deleteCourseTopic
);

// Assign instructor to track
router.post(
  "/assign-track",
  protectedRoutes,
  allowTo("Instructor"),
  assignInstructorToTrack
);

export default router;
