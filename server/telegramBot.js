import { Telegraf } from "telegraf";
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";

const app = express();
app.use(bodyParser.json());

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || "8073142544:AAEkaZ3LMeHqOYv_De0uJ3T4Mg7NavXmlDI");

let userStates = {}; // in-memory state
let followUps = {}; // In-memory store for follow-up reminders (simplified)

const PORT = process.env.PORT || 8080;
const WEBHOOK_URL = "https://job-application-tracker-e17w.vercel.app";

// set webhook
bot.telegram.setWebhook("https://job-application-tracker-e17w.vercel.app").then(() => console.log("✅ Webhook set")).catch(console.error);

// Check for follow-ups every hour
setInterval(() => checkFollowUps(), 60 * 60 * 1000); 
// setInterval(() => checkFollowUps(), 10000);
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

  await ctx.reply(`Welcome back ${user.name || ""}! 👋 What would you like to do?`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Add Application", callback_data: "yes" }, { text: "Check Status", callback_data: "status" }],
        [{ text: "Update Application", callback_data: "update" }, { text: "Delete Application", callback_data: "delete" }],
        [{ text: "Check Applications by Date", callback_data: "date" }, { text: "No", callback_data: "no" }],
      ],
    },
  });
});

// CALLBACK QUERIES


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
          [{ text: "Frontend Developer", callback_data: "frontend-developer" }, { text: "Backend Developer", callback_data: "backend-developer" }],
          [{ text: "Fullstack Developer", callback_data: "fullstack-developer" }, { text: "Software Engineer", callback_data: "software-engineer" }],
        ],
      },
    });
  } else if (state.step === "linkInput") {
    state.link = message.includes("http")
      ? { companyProfileLink: message }
      : { jd: message };

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
  } else if (state.step === "askCompanyName") {
    state.companyName = message;
    await fetchApplicationStatus(ctx, telegramId);
  } else if (state.step === "askApplicationId") {
    state.applicationId = message;
    state.step = "askStatus";
    await ctx.reply("Select the new status:", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Applied", callback_data: "applied" }, { text: "Resume Screening", callback_data: "resume-screening" }],
          [{ text: "Interview Process", callback_data: "interview-process" }, { text: "Waiting Result", callback_data: "waiting-result" }],
          [{ text: "Selected", callback_data: "selected" }, { text: "Rejected", callback_data: "rejected" }],
        ],
      },
    });
  } else if (state.step === "askDeleteApplicationId") {
    state.applicationId = message;
    await deleteApplication(ctx, telegramId);
  } else if (state.step === "askDate") {
    const datePattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    if (datePattern.test(message)) {
      state.date = message;
      await fetchApplicationsByDate(ctx, telegramId);
    } else {
      await ctx.reply("Please enter a valid date in MM/DD/YYYY format (e.g., 7/15/2025).");
    }
  }
});

// ASK OPTIONAL FIELDS
const askNextOptionalField = async (ctx, telegramId) => {
  const state = userStates[telegramId];

  if (!state.optionalQueue || state.optionalQueue.length === 0) {
    await saveApplication(telegramId, state);
    await ctx.reply("✅ Application saved! Thank you! 🎉");
    await askMoreOption(ctx, telegramId);
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

  const response = await fetch("https://job-application-tracker-e17w.vercel.app/api/v1/applications/add-application", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(applicationData),
  });

  const result = await response.json();

  if (!response.ok) throw new Error(result.error || "Failed to save application");

  console.log("✅ Application saved:", result);

  // Schedule follow-up (2 days from applicationDate)
  const followUpDate = new Date(data.applicationDate);
  followUpDate.setDate(followUpDate.getDate() + 2);
  followUps[result.data._id] = {
    telegramId,
    company: data.company,
    followUpDate: followUpDate.toLocaleDateString(),
  };
};

// FETCH APPLICATION STATUS
const fetchApplicationStatus = async (ctx, telegramId) => {
  const state = userStates[telegramId];
  const companyName = state.companyName;

  try {
    const response = await fetch(`https://job-application-tracker-e17w.vercel.app/api/v1/applications/fetch-application-by-company/${encodeURIComponent(companyName)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    console.log("Fetch response status:", response.status);

    const result = await response.json();

    if (!response.ok) throw new Error(result.error || "Failed to fetch status");

    if (result.data.length === 0) {
      await ctx.reply(`No applications found for ${companyName}.`);
    } else {
      const statuses = result.data.map(app => `${app.company} - ID: ${app._id} - Status: ${app.status} (Applied on: ${app.applicationDate})`).join("\n");
      await ctx.reply(`Application statuses for ${companyName}:\n${statuses}`);
    }

    await askMoreOption(ctx, telegramId);
  } catch (err) {
    console.error("Error fetching application status:", err);
    await ctx.reply("Sorry, I couldn’t fetch the status. Please try again later.");
    delete userStates[telegramId];
  }
};

// UPDATE APPLICATION
const updateApplication = async (ctx, telegramId) => {
  const state = userStates[telegramId];
  const applicationId = state.applicationId;
  const status = state.status;

  try {
    const response = await fetch(`https://job-application-tracker-e17w.vercel.app/api/v1/applications/update-application/${applicationId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    const result = await response.json();

    if (!response.ok) throw new Error(result.error || "Failed to update application");

    await ctx.reply(`✅ Application ${applicationId} updated to status: ${status}`);
    await askMoreOption(ctx, telegramId);
  } catch (err) {
    console.error("Error updating application:", err);
    await ctx.reply("Sorry, I couldn’t update the application. Please try again later.");
    delete userStates[telegramId];
  }
};

// DELETE APPLICATION
const deleteApplication = async (ctx, telegramId) => {
  const state = userStates[telegramId];
  const applicationId = state.applicationId;

  try {
    const response = await fetch(`https://job-application-tracker-e17w.vercel.app/api/v1/applications/delete-application/${applicationId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    if (!response.ok) throw new Error(result.error || "Failed to delete application");

    await ctx.reply(`✅ Application ${applicationId} deleted successfully`);
    await askMoreOption(ctx, telegramId);
  } catch (err) {
    console.error("Error deleting application:", err);
    await ctx.reply("Sorry, I couldn’t delete the application. Please try again later.");
    delete userStates[telegramId];
  }
};

// FETCH APPLICATIONS BY DATE
const fetchApplicationsByDate = async (ctx, telegramId) => {
  const state = userStates[telegramId];
  const date = state.date;

  try {
    const db = mongoose.connection.db;
    const users = db.collection("users");
    const user = await users.findOne({ telegramId });
    if (!user) throw new Error("User not linked yet!");

    const userId = user._id.toString();
    const response = await fetch(`https://job-application-tracker-e17w.vercel.app/api/v1/applications/fetch-application-by-date/${userId}/${encodeURIComponent(date)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    console.log("Fetch response status:", response.status);

    const result = await response.json();

    if (!response.ok) throw new Error(result.error || "Failed to fetch applications");

    await ctx.reply(`${result.message} on ${date}. Do you want to see the applications?`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Yes", callback_data: "yes" }, { text: "No", callback_data: "no" }],
        ],
      },
    });
    state.step = "showDetails";
  } catch (err) {
    console.error("Error fetching applications by date:", err);
    await ctx.reply("Sorry, I couldn’t fetch the applications. Please try again later.");
    delete userStates[telegramId];
  }
};

// DISPLAY APPLICATION DETAILS
const displayApplicationDetails = async (ctx, telegramId) => {
  const state = userStates[telegramId];
  const date = state.date;

  try {
    const db = mongoose.connection.db;
    const users = db.collection("users");
    const user = await users.findOne({ telegramId });
    if (!user) throw new Error("User not linked yet!");

    const userId = user._id.toString();
    const response = await fetch(`https://job-application-tracker-e17w.vercel.app/api/v1/applications/fetch-application-by-date/${userId}/${encodeURIComponent(date)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    console.log("Fetch response status:", response.status);

    const result = await response.json();

    if (!response.ok) throw new Error(result.error || "Failed to fetch applications");

    if (result.data.length === 0) {
      await ctx.reply(`No applications found for ${date}.`);
    } else {
      const details = result.data.map(app => `${app.company} - ID: ${app._id} - Status: ${app.status}`).join("\n");
      await ctx.reply(`Applications on ${date}:\n${details}`);
    }

    await askMoreOption(ctx, telegramId);
  } catch (err) {
    console.error("Error displaying application details:", err);
    await ctx.reply("Sorry, I couldn’t display the applications. Please try again later.");
    delete userStates[telegramId];
  }
};

// CHECK FOLLOW-UPS
const checkFollowUps = async () => {
  const today = new Date().toLocaleDateString();
  for (const [applicationId, followUp] of Object.entries(followUps)) {
    if (followUp.followUpDate === today) {
      await bot.telegram.sendMessage(followUp.telegramId, `⏰ Follow-up reminder: It's time to follow up with ${followUp.company}!`);
      delete followUps[applicationId]; // Remove after sending
    }
  }
};

// ASK MORE OPTION
const askMoreOption = async (ctx, telegramId) => {
  await ctx.reply("Do you want to know more?", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Yes", callback_data: "more_yes" }, { text: "No", callback_data: "more_no" }],
      ],
    },
  });
};

// HANDLE MORE OPTION
const handleMoreOption = async (ctx, telegramId, choice) => {
  if (choice === "more_yes") {
    userStates[telegramId] = { step: "greet" };
    await ctx.reply(`Great! What would you like to do?`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Add Application", callback_data: "yes" }, { text: "Check Status", callback_data: "status" }],
          [{ text: "Update Application", callback_data: "update" }, { text: "Delete Application", callback_data: "delete" }],
          [{ text: "Check Applications by Date", callback_data: "date" }, { text: "No", callback_data: "no" }],
        ],
      },
    });
  } else {
    await ctx.reply("Thank you so much! Have a happy day! 😊");
    delete userStates[telegramId];
  }
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