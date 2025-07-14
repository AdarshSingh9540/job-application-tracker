// app.js
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import addApplicationRouter from "./routes/v1/add.application.js";
import interviewQuestion from "./routes/v1/interview.question.js"
import cors from "cors";
import bot from './telegramBot.js'
dotenv.config();

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI||"")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.use("/api/v1/applications", addApplicationRouter);
app.use("/api/v1/question",interviewQuestion);

app.get("/", (req, res) => {
  res.json({ msg: "Hello" });
});
bot.launch();

const PORT = process.env.PORT ||8081 ;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
