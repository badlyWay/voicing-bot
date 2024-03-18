const kafka = require("./kafka");
const { handleVocing } = require("./voicer");

kafka.initConsumer(handleVocing);