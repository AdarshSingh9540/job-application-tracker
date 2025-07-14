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


// 🚀 START COMMAND
bot.start(async (ctx) => {
  const telegramId = ctx.from.id.toString();

  const db = mongoose.connection.db;
  const users = db.collection("users");

  const user = await users.findOne({ telegramId });

  if (!user) {
    ctx.reply(
      `👋 Hi ${ctx.from.first_name || ""}! Please link your account first:\n\n` +
      `👉 [Click here to link](https://crossing-axis-athens-functional.trycloudflare.com/link-telegram?telegramId=${telegramId})`,
      { parse_mode: "Markdown" }
    );
    return;
  }

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

  const state = userStates[telegramId];

  if (state.step === "greet") {
    if (message === "yes") {
      state.step = "company";
      await ctx.reply("Please enter the company name.");
    } else {
      await ctx.reply("Thank you! Feel free to return anytime. 😊");
      delete userStates[telegramId];
    }
    ctx.answerCbQuery();
  } else if (state.step === "role") {
    const roleMap = {
      "frontend-developer": "frontend-developer",
      "backend-developer": "backend-developer",
      "fullstack-developer": "fullstack-developer",
      "software-engineer": "software-engineer",
    };
    const role = roleMap[message];
    if (role) {
      state.role = role;
      state.applicationDate = new Date().toLocaleDateString();

      // queue optional fields
      state.optionalQueue = ["location", "stipend", "companyProfileLink", "jd"];
      state.step = "askOptional";
      await askNextOptionalField(ctx, telegramId);
    }
    ctx.answerCbQuery();
  } else if (state.step === "link") {
    state.link = message === "yes" ? null : undefined;
    if (message === "yes") {
      state.step = "linkInput";
      await ctx.reply("Please send the company link or JD.");
    } else {
      // proceed to optional questions
      state.optionalQueue = ["location", "stipend", "companyProfileLink", "jd"];
      state.step = "askOptional";
      await askNextOptionalField(ctx, telegramId);
    }
    ctx.answerCbQuery();
  } else if (message === "optional_yes") {
    state.step = "optionalInput";
    await ctx.reply(`Please enter the ${state.currentOptional}.`);
    ctx.answerCbQuery();
  } else if (message === "optional_no") {
    await askNextOptionalField(ctx, telegramId);
    ctx.answerCbQuery();
  }
});

// TEXT INPUTS
bot.on("text", async (ctx) => {
  const telegramId = ctx.from.id.toString();
  const message = ctx.message.text;

  if (!userStates[telegramId]) return;

  const state = userStates[telegramId];

  if (state.step === "company") {
    state.company = message;
    state.step = "role";
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
  } else if (state.step === "linkInput") {
    state.link = message.includes("http")
      ? { companyProfileLink: message }
      : { jd: message };

    // proceed to optional questions
    state.optionalQueue = ["location", "stipend", "companyProfileLink", "jd"];
    state.step = "askOptional";
    await askNextOptionalField(ctx, telegramId);
  } else if (state.step === "optionalInput") {
    const field = state.currentOptional;
    if (field === "stipend") {
      const stipend = parseFloat(message);
      if (!isNaN(stipend)) {
        state[field] = stipend;
      } else {
        await ctx.reply("Please enter a valid number for stipend.");
        return;
      }
    } else {
      state[field] = message;
    }

    await askNextOptionalField(ctx, telegramId);
  }
});

// ASK OPTIONAL FIELDS
const askNextOptionalField = async (ctx, telegramId) => {
  const state = userStates[telegramId];

  if (!state.optionalQueue || state.optionalQueue.length === 0) {
    await saveApplication(telegramId, state);
    await ctx.reply("✅ Application saved! Thank you! 🎉");
    delete userStates[telegramId];
    return;
  }

  const nextField = state.optionalQueue.shift();
  state.currentOptional = nextField;

  const questionMap = {
    location: "Do you want to add a location?",
    stipend: "Do you want to add a stipend?",
    companyProfileLink: "Do you want to add a company profile link?",
    jd: "Do you want to add a job description?",
  };

  await ctx.reply(questionMap[nextField], {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Yes", callback_data: "optional_yes" }, { text: "No", callback_data: "optional_no" }],
      ],
    },
  });
};

// SAVE APPLICATION
const saveApplication = async (telegramId, data) => {
  const db = mongoose.connection.db;
  const users = db.collection("users");

  const user = await users.findOne({ telegramId });

  if (!user) throw new Error("User not linked yet!");

  const applicationData = {
    userId: user._id.toString(),
    company: data.company,
    role: data.role,
    applicationDate: data.applicationDate,
    status: "applied",
  };

  if (data.link?.companyProfileLink) applicationData.companyProfileLink = data.link.companyProfileLink;
  if (data.link?.jd) applicationData.jd = data.link.jd;
  if (data.location) applicationData.location = data.location;
  if (data.stipend) applicationData.stipend = data.stipend;
  if (data.companyProfileLink) applicationData.companyProfileLink = data.companyProfileLink;
  if (data.jd) applicationData.jd = data.jd;

  const response = await fetch("http://localhost:8081/api/v1/applications/add-application", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(applicationData),
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
