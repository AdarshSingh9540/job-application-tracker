import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import addApplicationRouter from "../routes/v1/add.application.js";
import interviewQuestion from "../routes/v1/interview.question.js";
import cors from "cors";
import bot from "./telegramBot.js";

dotenv.config();

const app = express();
app.use(cors({
  origin: ["http://localhost:3000", "http://job-application-tracker-hd7g1232h.vercel.app", "https://job-application-tracker-beryl-nu.vercel.app"],
  methods: ["POST", "GET", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI || "")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// API routes
app.use("/api/v1/applications", addApplicationRouter);
app.use("/api/v1/question", interviewQuestion);

app.get("/", (req, res) => {
  res.json({ msg: "Hello" });
});

// Set webhook on startup with retry
(async () => {
  const WEBHOOK_URL = process.env.WEBHOOK_URL || "https://job-application-tracker-e17w.vercel.app";
  let attempts = 0;
  const maxAttempts = 3;
  while (attempts < maxAttempts) {
    try {
      await bot.telegram.setWebhook(WEBHOOK_URL);
      console.log(`✅ Webhook set to ${WEBHOOK_URL} on attempt ${attempts + 1}`);
      break;
    } catch (err) {
      attempts++;
      console.error(`❌ Webhook setup failed on attempt ${attempts}:`, err.message);
      if (attempts === maxAttempts) console.error("⚠️ Max attempts reached, webhook not set.");
      await new Promise(resolve => setTimeout(resolve, 1000 * attempts)); // Backoff
    }
  }
})();

// Webhook callback (defaults to /)
app.use(bot.webhookCallback());

// Webhook endpoint for logging
app.post("/", (req, res) => {
  console.log("Webhook received:", req.body);
  res.status(200).send("Webhook received");
});

// Export for Vercel
export default app;