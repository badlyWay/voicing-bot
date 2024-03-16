const TelegramBot = require("node-telegram-bot-api");
const kafka = require("./kafka")

const bot = new TelegramBot(process.env.API_KEY_BOT, {
    polling: true,
    autoStart: true,
});

bot.on("text", async msg => {
    try {
        const chatId = msg.chat.id;
        await bot.sendMessage(chatId, "Обработка... ");
        await kafka.sendMessage({
            chatId,
            url: msg.text,
        });
    } catch (error) {
        console.error(error);
    }
});

kafka.initConsumer(bot);