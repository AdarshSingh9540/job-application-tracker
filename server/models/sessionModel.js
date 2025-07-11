import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  user_id: String,
  session: String,
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "7d" 
  }
});

module.exports = mongoose.model("Session", sessionSchema);
