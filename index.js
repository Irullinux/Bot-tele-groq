require("dotenv").config();
const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const app = express();
app.use(express.json());

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const groqApiKey = process.env.GROQ_API_KEY;

const bot = new TelegramBot(botToken);

// Set Webhook
const webhookUrl = `https://bot-tele-groq.vercel.app/bot${botToken}`;
bot.setWebHook(webhookUrl);

app.post(`/bot${botToken}`, async (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Fungsi untuk memproses pertanyaan ke Groq API
async function askGroq(prompt) {
  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqApiKey}`,
        },
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error:", error);
    return "Maaf, terjadi kesalahan saat memproses permintaan.";
  }
}

// Respon otomatis dengan AI dari Groq
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  bot.sendMessage(chatId, "Sedang memproses...");

  const response = await askGroq(text);
  bot.sendMessage(chatId, response);
});

app.get("/", (req, res) => {
  res.send("Bot Telegram dengan Groq AI berjalan di Vercel!");
});

module.exports = app;
