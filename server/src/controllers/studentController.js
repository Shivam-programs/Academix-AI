import mongoose from "mongoose";
import Studentmodel from "../models/studentModel.js";
import Usermodel from "../models/userModel.js";
import CourseModel from "../models/coursesModel.js";
import { requireAuth } from "../middleware/auth.js";

export async function createProfile(req, res) {
  const user = await Usermodel.findById(req.user._id);
  if (!user) {
    return res.status(400).json({
      message: "User not found",
    });
  }

  const { phoneNumber, college, semester, bio, profileImage } = req.body;

  const student = await Studentmodel.create({
    userId: req.user._id,
    phoneNumber: phoneNumber,
    college: college,
    semester: semester,
    bio: bio,
    profileImage: profileImage,
  });

  res.send(201).json({
    message: "Profile created successfully",
  });
}

export async function studentDashboard(req, res) {
  const student = await Studentmodel.findOne({ userID: "req.user._id" });
  const user = await Usermodel.findById(req.user._id);

  if (!student) {
    return res.status(400).json({
      message: "Student not found",
    });
  }

  if (!user) {
    return res.status(400).json({
      message: "user not found",
    });
  }

  const studentId = student._id;
  const phoneNumber = student.phoneNumber;
  const college = student.college;
  const semester = student.semester;
  const bio = student.bio;
  const profileImage = student.profileImage;

  if (!studentId) {
    return res.status(404).json({
      message: "Student Id not found!",
    });
  }

  const enrolledCourses = await CourseModel.findOne({ students: studentId });
  const AllCourses = await CourseModel.find({});

  const buyedCourses =
    enrolledCourses.length > 0
      ? enrolledCourses
      : "You are not enrolled in any course";

  res.json({
    studentId,
    phoneNumber,
    college,
    semester,
    bio,
    profileImage,
    buyedCourses,
    AllCourses,
  });
}

export async function updateProfile(req, res) {
  const student = await Studentmodel.findOne({ userId: req.user._id });
  const user = await Usermodel.findById(req.user._id);
  const { newPhoneNumber, newCollege, newSemester, newBio, newProfileImage } =
    req.body;

  if (!student) {
    return res.status(400).json({
      message: "Student not found",
    });
  }

  if (!user) {
    return res.status(400).json({
      message: "user not found",
    });
  }

  student.phoneNumber = newPhoneNumber;
  student.college = newCollege;
  student.semester = newSemester;
  student.bio = newBio;
  student.profileImage = newProfileImage;
  student.save();
  res.status(200).json({
    message: "Profile updated successfully",
  });
}
