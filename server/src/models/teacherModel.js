import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        unique:true
    },

    qualification:String,

    specialization:String,

    experience:Number,

    bio:String,

    profileImage:String,

    institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institution"}

},{timestamps:true});

const Teachermodel = mongoose.model('Teacher', teacherSchema);
export default Teachermodel;
