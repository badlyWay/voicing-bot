const { kafka } = require("./kafka");

const producer = kafka.producer();

const sendMessage = async (message) => {
    await producer.connect();
    await producer.send({
        topic: process.env.PARSE_TOPIC,
        messages: [
            {
                value: JSON.stringify(message),
            }
        ]
    })
    await producer.disconnect();
}

module.exports = {
    sendMessage,
}