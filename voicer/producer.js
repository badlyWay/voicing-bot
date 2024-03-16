const { Partitioners } = require("kafkajs");
const { kafka } = require("./kafka");
const producer = kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner });

const sendMessage = async (topic, message) => {
    await producer.connect();
    await producer.send({
        topic,
        messages: [{
            value: JSON.stringify(message),
        }]
    })
    await producer.disconnect();
}

module.exports = {
    sendMessage
}