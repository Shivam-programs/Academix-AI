import mongoose from "mongoose";
const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    phoneNumber: String,

    college: String,

    semester: Number,

    bio: String,

    profileImage: String,
  },
  { timestamps: true },
);

const Studentmodel = mongoose.model("Student", studentSchema);
export default Studentmodel;
