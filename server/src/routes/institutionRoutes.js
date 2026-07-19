import express from "express"
import { approveApplication, assignTeachers, createCourse, dashboardAnalytics, rejectApplication, removeTeacher, updateprofile, viewApplications, viewCourses, viewTeachers } from "../controllers/instituteController.js";
import { isInstitution, requireAuth } from "../middleware/auth.js";
const router=express.Router();

router.get("/dashboard",requireAuth,isInstitution,dashboardAnalytics)
router.get("/courses",requireAuth,isInstitution,viewCourses)
router.post("/courses",requireAuth,isInstitution,createCourse)
router.get("/teachers",requireAuth,isInstitution,viewTeachers)
router.patch("/courses/:courseId/teachers",requireAuth,isInstitution,assignTeachers)
router.put("/updateprofile",requireAuth,isInstitution,updateprofile)
router.get("/applications",requireAuth,isInstitution,viewApplications)
router.patch("/applications/:applicationId/approve",requireAuth,isInstitution,approveApplication)
router.patch("/applications/:applicationId/reject",requireAuth,isInstitution,rejectApplication)
router.delete("/teachers/:teacherId/remove",requireAuth,isInstitution,removeTeacher)


export default router