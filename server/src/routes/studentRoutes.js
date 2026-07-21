import express from "express";
const studentRouter = express.Router();
import { requireAuth } from "../middleware/auth.js";
import * as studentController from "../controllers/studentController.js";

studentRouter.post(
  "/createProfile",
  requireAuth,
  studentController.createProfile,
);
studentRouter.get(
  "/dashboard",
  requireAuth,
  studentController.studentDashboard,
);
studentRouter.patch(
  "/updateprofile",
  requireAuth,
  studentController.updateProfile,
);
studentRouter.get("/mycourses", requireAuth, studentController.myCourses);

export default teacherRouter;
