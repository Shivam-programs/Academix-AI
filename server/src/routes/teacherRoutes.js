import express from "express";
const teacherRouter = express.Router();
import { requireAuth } from "../middleware/auth.js";
import * as teacherController from "../controllers/teacherController.js";


teacherRouter.get("/dashboard",requireAuth, teacherController.teacherDashboard);
teacherRouter.get("/institutes",requireAuth, teacherController.instituteList);
teacherRouter.get("/mycourses",requireAuth, teacherController.myCourses);
teacherRouter.get("/getclassrooms/:courseId",requireAuth, teacherController.getClassroom);


export default teacherRouter;  