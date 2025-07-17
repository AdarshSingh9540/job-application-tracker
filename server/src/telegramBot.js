import { Telegraf } from "telegraf";

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || "8073142544:AAEkaZ3LMeHqOYv_De0uJ3T4Mg7NavXmlDI");

let userStates = {}; // in-memory state
let followUps = {}; // In-memory store for follow-up reminders

// START COMMAND
bot.start(async (ctx) => {
  const telegramId = ctx.from.id.toString();

  const db = mongoose.connection.db;
  const users = db.collection("users");

  const user = await users.findOne({ telegramId });

  if (!user) {
    await ctx.reply(
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
bot.on("callback_query", async (ctx) => {
  const telegramId = ctx.from.id.toString();
  const message = ctx.callbackQuery.data;

  if (!userStates[telegramId]) {
    await ctx.answerCbQuery("Please start with /start");
    return;
  }

  const state = userStates[telegramId];

  if (state.step === "greet") {
    if (message === "yes") {
      state.step = "company";
      await ctx.reply("Please enter the company name.");
    } else if (message === "status") {
      state.step = "askCompanyName";
      await ctx.reply("Please enter the company name to check the status.");
    } else if (message === "update") {
      state.step = "askApplicationId";
      await ctx.reply("Please enter the application ID to update its status.");
    } else if (message === "delete") {
      state.step = "askDeleteApplicationId";
      await ctx.reply("Please enter the application ID to delete.");
    } else if (message === "date") {
      state.step = "askDate";
      await ctx.reply("Please enter the date (e.g., MM/DD/YYYY) or select from options:", {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Today", callback_data: new Date().toLocaleDateString() }],
            [{ text: "Yesterday", callback_data: new Date(Date.now() - 86400000).toLocaleDateString() }],
          ],
        },
      });
    } else {
      await ctx.reply("Thank you! Feel free to return anytime. 😊");
      delete userStates[telegramId];
    }
    await ctx.answerCbQuery();
  }
  // Add other state transitions as needed
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
          [{ text: "Frontend Developer", callback_data: "frontend-developer" }, { text: "Backend Developer", callback_data: "backend-developer" }],
          [{ text: "Fullstack Developer", callback_data: "fullstack-developer" }, { text: "Software Engineer", callback_data: "software-engineer" }],
        ],
      },
    });
  } else if (state.step === "linkInput") {
    state.link = message.includes("http") ? { companyProfileLink: message } : { jd: message };
    state.optionalQueue = ["location", "stipend", "companyProfileLink", "jd"];
    state.step = "askOptional";
    await askNextOptionalField(ctx, telegramId);
  } else if (state.step === "optionalInput") {
    const field = state.currentOptional;
    if (field === "stipend") {
      const stipend = parseFloat(message);
      if (!isNaN(stipend)) state[field] = stipend;
      else {
        await ctx.reply("Please enter a valid number for stipend.");
        return;
      }
    } else state[field] = message;
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
    } else await ctx.reply("Please enter a valid date in MM/DD/YYYY format (e.g., 7/15/2025).");
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
      inline_keyboard: [[{ text: "Yes", callback_data: "optional_yes" }, { text: "No", callback_data: "optional_no" }]],
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

  const response = await fetch(`${process.env.BACKEND_URL}/api/v1/applications/add-application`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(applicationData),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Failed to save application");
  console.log("✅ Application saved:", result);
  const followUpDate = new Date(data.applicationDate);
  followUpDate.setDate(followUpDate.getDate() + 2);
  followUps[result.data._id] = { telegramId, company: data.company, followUpDate: followUpDate.toLocaleDateString() };
};

// FETCH APPLICATION STATUS, UPDATE APPLICATION, DELETE APPLICATION, etc.
// (Keep your existing functions with `process.env.BACKEND_URL`)

// CHECK FOLLOW-UPS
const checkFollowUps = async () => {
  const today = new Date().toLocaleDateString();
  for (const [applicationId, followUp] of Object.entries(followUps)) {
    if (followUp.followUpDate === today) {
      await bot.telegram.sendMessage(followUp.telegramId, `⏰ Follow-up reminder: It's time to follow up with ${followUp.company}!`);
      delete followUps[applicationId];
    }
  }
};

// ASK MORE OPTION
const askMoreOption = async (ctx, telegramId) => {
  await ctx.reply("Do you want to know more?", {
    reply_markup: {
      inline_keyboard: [[{ text: "Yes", callback_data: "more_yes" }, { text: "No", callback_data: "more_no" }]],
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

// Export bot for use in app.js
export default bot;