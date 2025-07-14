import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  userId: {  // 👈 identifies which user owns this application
    type: mongoose.Schema.Types.ObjectId, // or String if you use email
    required: true,
    ref: "User",
  },
  company: {
    type: String,
    required: true,
  },
  location: String,
  stipend: Number,
  companyProfileLink: String,
  jd: String,
  role: {
    type: String,
    enum: [
      "frontend-developer",
      "backend-developer",
      "fullstack-developer",
      "software-engineer",
    ],
    required: true,
  },
  status: {
    type: String,
    enum: [
      "applied",
      "resume-screening",
      "interview-process",
      "waiting-result",
      "selected",
      "rejected",
    ],
    default: "applied",
  },
  applicationDate: String,
});

const Company = mongoose.model("Application", applicationSchema);
export default Company;