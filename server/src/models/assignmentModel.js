import mongoose from "mongoose";
const assignmentSchema = new mongoose.Schema({
    title: String,
    description: String,
    attachment: String,
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    }
});

const AssignmentModel = mongoose.model("Assignment", assignmentSchema);
export default AssignmentModel;