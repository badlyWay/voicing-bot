const fs = require("node:fs");
const { kafka } = require("./kafka");
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
                const { chatId, audio, articleTitle } = JSON.parse(message.value);

                if (audio) {
                    const stream = await fs.createReadStream(audio);

                    await bot.sendAudio(chatId, stream, {}, {
                        filename: articleTitle,
                        contentType: "audio/mpeg",
                    });
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