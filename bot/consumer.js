const { kafka } = require("./kafka");
const { supabaseApi } = require("./supabase");
const consumer = kafka.consumer({ groupId: process.env.BOT_CONSUMER });

const initConsumer = async (bot) => {
    try {
        await consumer.connect();
        await consumer.subscribe({
            topic: process.env.VOICER_TOPIC,
            fromBeginning: true,
        });
        await consumer.run({
            eachMessage: async ({ message }) => {
                const { chatId, audioName, articleTitle } = JSON.parse(message.value);
                if (audioName) {
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
                }
                else {
                    throw new Error("Не удалось сгенерировать озвучку.");
                }
            }
        });
    } catch (error) {
        await bot.sendMessage("Ошибка: ", error);
        console.log(error);
    }
}

module.exports = {
    initConsumer
}