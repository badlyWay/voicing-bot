const { sendMessage } = require("./producer");

const handleVocing = (parseData) => {
    const voicedText = parseData.pageText; // voicing text

    sendMessage({
        chatId: parseData.chatId,
        audio: voicedText,
    });

};

module.exports = {
    handleVocing
}