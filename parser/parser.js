const { sendMessage } = require("./producer");

const handlePageParse = (parseData) => {
    const pageText = parseData.url // text of the page
    const newData = {
        chatId: parseData.chatId,
        pageText
    }
    sendMessage(newData);
};

module.exports = {
    handlePageParse
}