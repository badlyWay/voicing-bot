const { Kafka, Partitioners } = require("kafkajs");
const { handlePageParse } = require("../parser");

const kafka = new Kafka({
    clientId: process.env.SERVICE_ID,
    brokers: [process.env.KAFKA_API],
});

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
        console.error(error);
    }
};

const producer = kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner });

const sendMessage = async (topic, message) => {
    await producer.connect();
    await producer.send({
        topic,
        messages: [
            {
                value: JSON.stringify(message)
            }
        ]
    })
    await producer.disconnect();
}

module.exports = {
    initConsumer,
    sendMessage,
}