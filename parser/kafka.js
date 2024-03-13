const { Kafka } = require("kafkajs");

const kafka = new Kafka({
    clientId: process.env.SERVICE_ID,
    brokers: [process.env.KAFKA_API],
});

module.exports = {
    kafka
}