// app.js
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import addApplicationRouter from "../routes/v1/add.application.js";
import interviewQuestion from "../routes/v1/interview.question.js"
import cors from "cors";
import bot from '../telegramBot.js'
// import { Telegraf } from "telegraf";
dotenv.config();

const app = express();
app.use(cors({
  origin: ["http://localhost:3000","http://job-application-tracker-hd7g1232h.vercel.app/"],
  methods: ["POST", "GET","PUT","DELETE"],
  credentials: true
}));
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

// const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// bot.start((ctx) => {
//   const telegramId = ctx.from.id;

//   ctx.reply(
//     `👋 Hi ${ctx.from.first_name || ""}! Please link your account:\n\n` +
//     `👉 [Click here to link](https://crossing-axis-athens-functional.trycloudflare.com/link-telegram?telegramId=${telegramId})`,
//     { parse_mode: "Markdown" }
//   );
// });

// // launch the bot
// bot.launch()
// .then(() => console.log("🤖 Telegram Bot started"))
// .catch(err => console.error("❌ Bot Error", err));


// const PORT = process.env.PORT ||8081 ;

// app.listen(PORT, () => {
//   console.log(`🚀 Server is running on port ${PORT}`);
// });
export default app;