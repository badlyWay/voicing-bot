const TelegramBot = require("node-telegram-bot-api");
const { kafka } = require("./kafka");
const { supabaseApi } = require("./supabase");
const consumer = kafka.consumer({ groupId: process.env.BOT_CONSUMER });

const topicsRouter = {
    [process.env.VOICER_TOPIC]: async (bot, message) => {
        const { chatId, audioName, articleTitle } = JSON.parse(message.value);

        try {
            const bucket = process.env.STORAGE_BUCKET;
            const { data, error } = await supabaseApi.storage.from(bucket).download(audioName);

            if (error) throw new Error("Ошибка поиска: ", error);

            const blob = await data.arrayBuffer();
            const bufferData = Buffer.from(blob);

            await bot.sendAudio(chatId, bufferData, {}, {
                filename: articleTitle + ".mp3",
                contentType: process.env.AUDIO_DATA_FORMAT,
            });
            await supabaseApi.storage.from(bucket).remove([audioName]);
        } catch (error) {
            bot.sendMessage(chatId, error);
        }
    },
    [process.env.ERROR_TOPIC]: async (bot, message) => {
        const { chatId, error } = JSON.parse(message.value);

        await bot.sendMessage(chatId, error);
    },
};

/** Event Listener
 * @param {TelegramBot} bot
 */

const initConsumer = async (bot) => {
    try {
        await consumer.connect();
        await consumer.subscribe({
            topics: [
                process.env.VOICER_TOPIC,
                process.env.ERROR_TOPIC
            ],
            fromBeginning: true,
        });
        await consumer.run({
            eachMessage: ({ message, topic }) => topicsRouter[topic]?.(bot, message),
        });
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    initConsumer
}