const { kafka } = require("./kafka");
const consumer = kafka.consumer({ groupId: process.env.BOT_CONSUMER });

const initConsumer = async (bot) => {
    try {
        await consumer.connect();
        await consumer.subscribe({
            topic: process.env.VOICER_TOPIC,
            fromBeginning: true,
        })
        await consumer.run({
            eachMessage: async ({ message }) => {
                const { chatId, audio } = JSON.parse(message.value);
                if (audio) {
                    await bot.sendMessage(chatId, audio);
                }
            }
        })
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    initConsumer
}