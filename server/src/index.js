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

// Set webhook to root path with retry
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

// Webhook callback at root path
app.use(bot.webhookCallback());

// Enhanced webhook endpoint for logging and processing
app.post("/", (req, res) => {
  console.log("Webhook received:", req.body);
  try {
    bot.handleUpdate(req.body, res);
    res.status(200).send("Webhook processed");
  } catch (err) {
    console.error("Error processing webhook:", err);
    res.status(500).send("Error processing webhook");
  }
});

// Export for Vercel
export default app;