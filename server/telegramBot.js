import { Telegraf } from "telegraf";
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import Company from "./models/company.model.js";

const app = express();
app.use(bodyParser.json());

// Replace with your BotFather token or use env variable
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || "8073142544:AAEkaZ3LMeHqOYv_De0uJ3T4Mg7NavXmlDI");

let userStates = {}; // In-memory state (use Redis/Mongo for production)

const PORT = process.env.PORT || 8080;
const WEBHOOK_URL = process.env.WEBHOOK_URL || "https://d3bfa506dd88.ngrok-free.app"; // Replace with ngrok URL

bot.telegram.setWebhook(WEBHOOK_URL).then(() => console.log("Webhook set")).catch(err => console.error("Webhook error:", err));

bot.start((ctx) => {
  const from = ctx.from.id;
  userStates[from] = { step: "greet" };
  ctx.reply("Hello! 👋 Would you like to add a job application?", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Yes", callback_data: "yes" }, { text: "No", callback_data: "no" }],
      ],
    },
  });
});

bot.on("callback_query", async (ctx) => {
  const from = ctx.from.id;
  const message = ctx.callbackQuery.data;

  if (userStates[from]?.step === "greet") {
    if (message === "yes") {
      userStates[from].step = "company";
      await ctx.reply("Please enter the company name.");
    } else {
      await ctx.reply("Thank you! Feel free to return anytime. 😊");
      delete userStates[from];
    }
    ctx.answerCbQuery();
  } else if (userStates[from]?.step === "role") {
    const roleMap = {
      "frontend-developer": "frontend-developer",
      "backend-developer": "backend-developer",
      "fullstack-developer": "fullstack-developer",
      "software-engineer": "software-engineer",
    };
    const role = roleMap[message] || roleMap[ctx.message?.text.toLowerCase()];
    if (role) {
      userStates[from].role = role;
      userStates[from].step = "link";
      userStates[from].applicationDate = new Date().toLocaleDateString();
      await ctx.reply(`Role selected: ${role}\nWould you like to add a company link or JD?`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Yes", callback_data: "yes" }, { text: "No", callback_data: "no" }],
          ],
        },
      });
      ctx.answerCbQuery();
    }
  } else if (userStates[from]?.step === "link") {
    userStates[from].link = message === "yes" ? null : undefined;
    if (message === "yes") {
      userStates[from].step = "linkInput";
      await ctx.reply("Please send the company link or JD.");
    } else {
      await saveApplication(from, userStates[from]);
      await ctx.reply("Application saved! Thank you! 🎉");
      delete userStates[from];
    }
    ctx.answerCbQuery();
  }
});

bot.on("text", async (ctx) => {
  const from = ctx.from.id;
  const message = ctx.message.text;

  if (userStates[from]?.step === "company") {
    userStates[from].company = message;
    userStates[from].step = "role";
    await ctx.reply("Select a role:", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Frontend Developer", callback_data: "frontend-developer" }],
          [{ text: "Backend Developer", callback_data: "backend-developer" }],
          [{ text: "Fullstack Developer", callback_data: "fullstack-developer" }],
          [{ text: "Software Engineer", callback_data: "software-engineer" }],
        ],
      },
    });
  } else if (userStates[from]?.step === "linkInput") {
    userStates[from].link = message.includes("http") ? { companyProfileLink: message } : { jd: message };
    await saveApplication(from, userStates[from]);
    await ctx.reply("Application saved with link/JD! Thank you! 🎉");
    delete userStates[from];
  }
});


const saveApplication = async (userId, data) => {
  try {
    console.log(JSON.stringify({
      userId: String(userId),      
        company: data.company,
        role: data.role,
        applicationDate: data.applicationDate,
        ...data.link,
        status: "applied",
      }))
    const response = await fetch(`
http://localhost:8081/api/v1/applications/add-application`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
      userId: '68703dbdb65b9f8c39febb6e',      
        company: data.company,
        role: data.role,
        applicationDate: data.applicationDate,
        ...data.link,
        status: "applied",
      }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to save");
    console.log("Application saved:", result);
  } catch (err) {
    console.error("Error saving application:", err);
  }
};

// Handle webhook updates
app.use(bot.webhookCallback('/webhook'));

app.post("/webhook", (req, res) => {
  console.log("Webhook received:", req.body);
  res.status(200).send("Webhook received");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default bot;