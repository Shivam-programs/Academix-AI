import mongoose from "mongoose";

const applicationSchema=new mongoose.Schema({
  teacherId:{
  type:mongoose.Schema.Types.ObjectId ,
  ref:"Teacher",
  required:true,
},
  institutionId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Institution",
    required:true
  },
  status:{
    type:String,
    enum:["Approved","Pending","Rejected"],
    default:"Pending",
    required:true
  }},
  {timestamps:true},)

  const applicationModel=mongoose.model("Application",applicationSchema);
  export default applicationModel