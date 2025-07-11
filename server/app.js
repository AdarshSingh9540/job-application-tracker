// app.js
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import addApplicationRouter from "./routes/v1/add.application.js";
import cors from "cors";
dotenv.config();

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI||"")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.use("/api/v1/applications", addApplicationRouter);

app.get("/", (req, res) => {
  res.json({ msg: "Hello" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
