require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const userMessage = msg.text;

    if (!userMessage) return;

    // Kirim "Typing..." saat memproses
    bot.sendChatAction(chatId, "typing");

    try {
        const response = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "llama3-70b-8192", // Model Groq
                messages: [
                    { role: "system", content: "Jawablah semua pertanyaan dalam bahasa Indonesia." },
                    { role: "user", content: userMessage }
                ],
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${GROQ_API_KEY}`,
                },
            }
        );

        const reply = response.data.choices[0]?.message?.content || "Gagal mendapatkan jawaban.";
        bot.sendMessage(chatId, reply);
    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
        bot.sendMessage(chatId, "Terjadi kesalahan saat memproses permintaan.");
    }
});

console.log("Bot sedang berjalan...");
