import mongoose from "mongoose";
const interviewQuestionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  isPublic: {
    type: Boolean,
    default: false, // False for private, true for public
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const InterviewQuestion = mongoose.model("InterviewQuestion",  interviewQuestionSchema);
export default InterviewQuestion;