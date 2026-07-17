import express from "express";
const teacherRouter = express.Router();
import { requireAuth } from "../middleware/auth.js";
import { teacherDashboard } from "../controllers/teacherController.js";


teacherRouter.get("/dashboard",requireAuth, teacherDashboard);


export default teacherRouter;  