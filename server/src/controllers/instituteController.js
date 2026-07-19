import applicationModel from "../models/applicationModel.js"
import CourseModel from "../models/coursesModel.js"
import Institutionmodel from "../models/instituteModel.js"
import Studentmodel from "../models/studentModel.js"
import Teachermodel from "../models/teacherModel.js"


export const dashboardAnalytics=async (req,res)=>{
  try {
  const institute=await Institutionmodel.findOne({userId:req.user._id})
  if(!institute)return res.status(404).json({message:"Institute does not exist"})
  const totalcourses=await CourseModel.countDocuments({institutionId:institute._id})
  const courses=await CourseModel.find({institutionId:institute._id});
  let totalEnrolledStudents=0;
  for(const course of courses){
    totalEnrolledStudents+=course.students.length;
  }
  const totalTeachers=await Teachermodel.countDocuments({institutionId:institute._id});
  return res.status(200).json({
    status:200,
    totalEnrolledStudents,totalTeachers,totalCourses
  })
  }
  catch (error) {
     return res.status(500).json({message:error.message});
  } 
}

export const viewCourses=async (req,res)=>{
  try {
  const institute=await Institutionmodel.findOne({userId:req.user._id}) 
  if(!institute)return res.status(404).json({message:"Institute does not exist"})
  const courses=await CourseModel.find({institutionId:institute._id})
  return res.status(200).json({courses})
  } catch (error) {
    return res.status(500).json({message:error.message})
  }
}

export const createCourse=async(req,res)=>{
  try {
  const institute = await Institutionmodel.findOne({userId:req.user._id});
  if(!institute) return res.status(404).json({message:"Institute does not exist"})
  const{title,description,duration,startingDate,endingDate} = req.body;
  if(!title||!description||!duration||!startingDate||!endingDate) return res.status(400).json({message:"All fields are required"});
  const newCourse = new CourseModel({title,description,duration,startingDate,endingDate,institutionId:institute._id})
  await newCourse.save();
  return res.status(201).json({
    message:"course created successfully",
    course: newCourse})
  } catch (error) {
    return res.status(500).json({message:error.message})
  }
}

export const viewTeachers=async(req,res)=>{
  try {
  const institute=await Institutionmodel.findOne({userId:req.user._id})
  if(!institute)return res.status(404).json({message:"Institue does not exist"})
  const teachers=await Teachermodel.find({institutionId:institute._id})
  return res.status(200).json({teachers})
  } catch (error) {
    return res.status(500).json({message:error.message})
  }
}

export const assignTeachers=async(req,res)=>{
  try {
  const {courseId}=req.params;
  const {teacherIds}=req.body;
  if(!teacherIds||!Array.isArray(teacherIds))return res.status(400).json({message:"At least one teacher is required"});
  const institute=await Institutionmodel.findOne({userId:req.user._id})
  if(!institute)return res.status(404).json({message:"Institute does not exist"})
  const course=await CourseModel.findById(courseId);
  if(!course)return res.status(404).json({message:"Course doesnt exist"});
  if(!course.institutionId.equals(institute._id)) return res.status(403).json({message:"Access Forbidden"});
  const teachers = await Teachermodel.find({
      _id: { $in: teacherIds },
      institutionId: institute._id,
    });
  if (teachers.length !== teacherIds.length) {
      return res.status(400).json({
        message: "One or more teachers do not belong to your institute.",
      });
    }
  course.teachers=teacherIds;
  await course.save();
  return res.status(200).json({message:"Successfully updated course",course:course});
  } catch (error) {
    return res.status(500).json({message:error.message})
  }
}

export const updateprofile=async(req,res)=>{
  try {
  const{instituteName,phone,website,address,description,logo}=req.body;
  const institute=await Institutionmodel.findOne({userId:req.user._id});
  if(!institute)return res.status(404).json({message:"Institute does not exist"});
  await Institutionmodel.updateOne({userId:req.user._id},{instituteName,phone,website,address,description,logo})
  return res.status(200).json({message:"Profile updated successfully"}) 
  } catch (error) {
    return res.status(500).json({message:error.message})
  }
}

export const viewApplications=async(req,res)=>{
  try {
  const institute=await Institutionmodel.findOne({userId:req.user._id});
  if(!institute)return res.status(404).json({message:"Institute does not exist"});
  const application=await applicationModel.find({institutionId:institute._id,status:"Pending"});
  if(application.length==0)return res.status(404).json({message:"No application found"});
  return res.status(200).json({application})
  } catch (error) {
    return res.status(500).json({message:error.message})
  }
}

  export const approveApplication=async(req,res)=>{
    try {
    const institute=await Institutionmodel.findOne({userId:req.user._id})
    if(!institute)return res.status(404).json({message:"Institute does not exist"});
    const application=await applicationModel.findById(req.params.applicationId);
    if(!application)return res.status(404).json({message:"Application does not exist"});
    if(application.status!=="Pending")return res.status(400).json({message:"Appllcation has alredy been proccessed"})
    if(application.institutionId.equals(institute._id)){
    application.status="Approved";
    const teacher=await Teachermodel.findById(application.teacherId);
    if(!teacher)return res.status(404).json({message:"Teacher does not exist"});
    teacher.institutionId=institute._id;
    await application.save();
    await teacher.save();
    return res.status(200).json({message:"Application approved"})
    }else{
      return res.status(403).json({message:"Unauthorized"})
    }
    } catch (error) {
      return res.status(500).json({message:error.message})
    }
  }

export const rejectApplication=async(req,res)=>{
  try {
  const institute=await Institutionmodel.findOne({userId:req.user._id});
  if(!institute)return res.status(404).json({message:"Institute does not exist"});
  const application=await applicationModel.findById(req.params.applicationId);
  if(!application)return res.status(404).json({message:"Application does not exist"});
  if(!application.institutionId.equals(institute._id))return res.status(403).json({message:"Unauthorized"});
  if(application.status!=="Pending")return res.status(400).json({message:"Application has alredy been proccessed"})
  application.status="Rejected";
  await application.save();
  return res.status(200).json({message:"Application rejected"})
  } catch (error) {
    return res.status(500).json({message:error.message})
  }
}

export const removeTeacher=async(req,res)=>{
  try {
  const institute=await Institutionmodel.findOne({userId:req.user._id});
  if(!institute)return res.status(404).json({message:"Institute does not exist"});
  const teacher =await Teachermodel.findOne({_id:req.params.teacherId,institutionId:institute._id})
  if(!teacher)return res.status(404).json({message:"Teacher not found"});
  teacher.institutionId=null;
  await teacher.save();
  await CourseModel.updateMany({institutionId:institute._id},{$pull:{teachers:teacher._id}})
  return res.status(200).json({message:'Teacher removed successfully'})
  } catch (error) {
    return res.status(500).json({message:error.message})
  }
}