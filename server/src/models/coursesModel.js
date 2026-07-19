import mongoose from "mongoose"
const courseSchema= new mongoose.Schema({
  title:{
    type:String,
    required:true
  },
  description:{
    type:String,
    required:true
  },
  duration:{
    type:Number,
    required:true
  },
  startingDate:{
    type:Date,
    required:true
  },
  endingDate:{
    type:Date,
    required:true
  },
  institutionId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Institution",
    required:true,
  },
  teachers:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Teacher",
  }],
  students:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Student",
  }]
})

const CourseModel= mongoose.model("Course",courseSchema)
const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  startingDate: {
    type: Date,
    required: true
  },
  endingDate: {
    type: Date,
    required: true
  },
  instituteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institution",
    required: true,
  },
  teachers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
  }],
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  }],

})

const CourseModel = mongoose.model("Course", courseSchema)
export default CourseModel