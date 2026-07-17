import mongoose from "mongoose";
import Teachermodel from "../models/teacherModel.js";
import CourseModel from "../models/coursesModel.js";
import Institutionmodel from "../models/instituteModel.js";
import Usermodel from "../models/userModel.js";
import { requireAuth } from "../middleware/auth.js";

export async function teacherDashboard(req, res) {
    try {
        const teacher = await Teachermodel.findOne({ userId: req.user._id });
        const user = await Usermodel.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }
        const teacherId = teacher._id;
        const teacherName = user.username;
        const teacherFullName = teacher.FullName;
        const teacherBio = teacher.bio;
        const teacherQualification = teacher.qualification;
        const teacherSpecialization = teacher.specialization;
        const teacherExperience = teacher.experience;
        const teacherProfilePicture = teacher.profileImage;

        if (!teacherId) {
            return res.status(404).json({ message: "Teacher ID not found" });
        }

        const totalCourses = await CourseModel.countDocuments({ teachers: teacher._id });
        const totalStudents = await CourseModel.aggregate([
            { $match: { teachers: teacher._id } },
            { $unwind: "$students" },
            { $group: { _id: null, count: { $sum: 1 } } }
        ]);
        const studentCount = totalStudents.length > 0 ? totalStudents[0].count : 0;
        const institutionId = teacher.institutionId;
        const institution = await Institutionmodel.findById(institutionId);
        const institutionName = institution ? institution.name : "N/A";

        res.json({ institutionName, totalCourses, teacherFullName, studentCount, teacherId, teacherName, teacherBio, teacherQualification, teacherSpecialization, teacherExperience, teacherProfilePicture });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

export const instituteList = async (req, res) => {
    try {
        const institutes = await instituteModel
            .find()
            .select("-_id -userId -updatedAt -__v")
            .sort({ instituteName: 1 });

        res.json(institutes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

export const myCourses = async (req, res) => {
    try {
        const teacher = await Teachermodel.findOne({ userId: req.user._id });
        const courses = await CourseModel.find({ teachers: teacher._id });
        res.json(courses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};



export const getClassroom = async (req, res) => {
    try {
        const teacher = await Teachermodel.findOne({
            userId: req.user._id
        });
        if (!teacher) {
            return res.status(404).json({
                message: "Teacher not found"
            });
        }

        const course = await CourseModel.findOne({
            _id: req.params.courseId,
            teachers: teacher._id
        });

        if (!course) {
            return res.status(404).json({
                message: "Course not found"
            });
        }

        const assignments = await AssignmentModel.find({
            courseId: course._id
        });

        res.json(assignments);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
