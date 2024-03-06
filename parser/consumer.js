const { handlePageParse } = require("./parser");
const { kafka } = require("./kafka");

const consumer = kafka.consumer({ groupId: process.env.PARSE_CONSUMER });

const initConsumer = async () => {
    try {
        await consumer.connect();
        await consumer.subscribe({ topic: process.env.PARSE_TOPIC, fromBeginning: true });
        await consumer.run({
            eachMessage: async ({ message }) => {
                handlePageParse(JSON.parse(message.value))
            }
        });
    }
    catch (error) {
        console.log(error)
    }
}

module.exports = {
    initConsumer
}