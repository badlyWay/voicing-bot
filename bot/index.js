const TelegramBot = require("node-telegram-bot-api");
const kafka = require("./kafka")

const bot = new TelegramBot(process.env.API_KEY_BOT, {
    polling: true,
    autoStart: true,
});

bot.onText(/\/start/, async msg => {
    try {
        await bot.sendMessage(msg.chat.id, `Привет ${msg.from.username || msg.from.first_name}!\nОтправь мне ссылку статьи и я попробую её озвучить.`);

        bot.on("message", async msg => {
            const chatId = msg.chat.id;
            await bot.sendMessage(chatId, "Обработка.\nЭто может занять некоторое время. ");
            await kafka.sendMessage({
                chatId,
                url: msg.text,
            });
        });

    } catch (error) {
        console.error(error);
        bot.sendMessage("Что-то пошло не так...\n", error);
    }
});

kafka.initConsumer(bot);