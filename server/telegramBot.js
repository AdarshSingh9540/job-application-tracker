import { Telegraf } from "telegraf";
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";

const app = express();
app.use(bodyParser.json());

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || "8073142544:AAEkaZ3LMeHqOYv_De0uJ3T4Mg7NavXmlDI");

let userStates = {}; // in-memory state

const PORT = process.env.PORT || 8080;
const WEBHOOK_URL = process.env.WEBHOOK_URL || "https://d3bfa506dd88.ngrok-free.app";

// set webhook
bot.telegram.setWebhook(WEBHOOK_URL).then(() => console.log("✅ Webhook set")).catch(console.error);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// 🚀 START COMMAND
bot.start(async (ctx) => {
  const telegramId = ctx.from.id.toString();

  const db = mongoose.connection.db;
  const users = db.collection("users");

  const user = await users.findOne({ telegramId });

  if (!user) {
    // user not linked → send link
    ctx.reply(
      `👋 Hi ${ctx.from.first_name || ""}! Please link your account first:\n\n` +
      `👉 [Click here to link](https://crossing-axis-athens-functional.trycloudflare.com/link-telegram?telegramId=${telegramId})`,
      { parse_mode: "Markdown" }
    );
    return;
  }

  // user already linked → proceed
  userStates[telegramId] = { step: "greet" };

  await ctx.reply(`Welcome back ${user.name || ""}! 👋 Would you like to add a job application?`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Yes", callback_data: "yes" }, { text: "No", callback_data: "no" }],
      ],
    },
  });
});

// CALLBACK QUERIES
bot.on("callback_query", async (ctx) => {
  const telegramId = ctx.from.id.toString();
  const message = ctx.callbackQuery.data;

  if (!userStates[telegramId]) {
    ctx.answerCbQuery("Please start with /start");
    return;
  }

  if (userStates[telegramId].step === "greet") {
    if (message === "yes") {
      userStates[telegramId].step = "company";
      await ctx.reply("Please enter the company name.");
    } else {
      await ctx.reply("Thank you! Feel free to return anytime. 😊");
      delete userStates[telegramId];
    }
    ctx.answerCbQuery();
  } else if (userStates[telegramId].step === "role") {
    const roleMap = {
      "frontend-developer": "frontend-developer",
      "backend-developer": "backend-developer",
      "fullstack-developer": "fullstack-developer",
      "software-engineer": "software-engineer",
    };
    const role = roleMap[message];
    if (role) {
      userStates[telegramId].role = role;
      userStates[telegramId].step = "link";
      userStates[telegramId].applicationDate = new Date().toLocaleDateString();
      await ctx.reply(`Role selected: ${role}\nWould you like to add a company link or JD?`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Yes", callback_data: "yes" }, { text: "No", callback_data: "no" }],
          ],
        },
      });
      ctx.answerCbQuery();
    }
  } else if (userStates[telegramId].step === "link") {
    userStates[telegramId].link = message === "yes" ? null : undefined;
    if (message === "yes") {
      userStates[telegramId].step = "linkInput";
      await ctx.reply("Please send the company link or JD.");
    } else {
      await saveApplication(telegramId, userStates[telegramId]);
      await ctx.reply("✅ Application saved! Thank you! 🎉");
      delete userStates[telegramId];
    }
    ctx.answerCbQuery();
  }
});

// TEXT INPUTS
bot.on("text", async (ctx) => {
  const telegramId = ctx.from.id.toString();
  const message = ctx.message.text;

  if (!userStates[telegramId]) return;

  if (userStates[telegramId].step === "company") {
    userStates[telegramId].company = message;
    userStates[telegramId].step = "role";
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
  } else if (userStates[telegramId].step === "linkInput") {
    userStates[telegramId].link = message.includes("http")
      ? { companyProfileLink: message }
      : { jd: message };
    await saveApplication(telegramId, userStates[telegramId]);
    await ctx.reply("✅ Application saved with link/JD! Thank you! 🎉");
    delete userStates[telegramId];
  }
});

// SAVE APPLICATION
const saveApplication = async (telegramId, data) => {
  const db = mongoose.connection.db;
  const users = db.collection("users");

  const user = await users.findOne({ telegramId });

  if (!user) throw new Error("User not linked yet!");

  const response = await fetch("http://localhost:8081/api/v1/applications/add-application", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: user._id.toString(),
      company: data.company,
      role: data.role,
      applicationDate: data.applicationDate,
      ...data.link,
      status: "applied",
    }),
  });

  const result = await response.json();

  if (!response.ok) throw new Error(result.error || "Failed to save application");

  console.log("✅ Application saved:", result);
};

// WEBHOOK
app.use(bot.webhookCallback('/webhook'));

app.post("/webhook", (req, res) => {
  console.log("Webhook received:", req.body);
  res.status(200).send("Webhook received");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default bot;
