const kafka = require("./kafka");
const { handlePageParse } = require("./parser");

kafka.initConsumer(handlePageParse);