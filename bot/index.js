const TelegramBot = require("node-telegram-bot-api");
const { sendMessage } = require("./producer");
const { initConsumer } = require("./consumer");

const bot = new TelegramBot(process.env.API_KEY_BOT, {
    polling: true,
    autoStart: true,
});

bot.on("text", async msg => {
    try {
        const chatId = msg.chat.id;
        await bot.sendMessage(chatId, "Обработка... ");
        await sendMessage({
            chatId,
            url: msg.text,
        });
    } catch (error) {
        console.log(error);
    }
});

initConsumer(bot);