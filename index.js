const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.API_KEY_BOT, {
    polling: true,
    autoStart: true,
});

bot.on('text', async msg => {
    try {
        await bot.sendMessage(msg.chat.id, msg.text);
    } catch (error) {
        console.log(error)
    }

})