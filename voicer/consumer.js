const { kafka } = require("./kafka");
const { handleVocing } = require("./voicer");

const consumer = kafka.consumer({ groupId: process.env.VOICE_CONSUMER });

const initConsumer = async () => {
    try {
        await consumer.connect();
        await consumer.subscribe({
            topic: process.env.BUFFER_TOPIC,
            fromBeginning: true,
        })

        await consumer.run({
            eachMessage: async ({ message }) => {
                handleVocing(JSON.parse(message.value));
            }
        })
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    initConsumer
}