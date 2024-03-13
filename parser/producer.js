const { Partitioners } = require('kafkajs');
const { kafka } = require("./kafka");
const producer = kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner });

const sendMessage = async (message) => {
    await producer.connect();
    await producer.send({
        topic: process.env.BUFFER_TOPIC,
        messages: [
            {
                value: JSON.stringify(message)
            }
        ]
    })
    await producer.disconnect();
}

module.exports = {
    sendMessage
}