const fs = require("node:fs");
const path = require("node:path");
const { sendMessage } = require("./producer");
const { createAudioFile } = require('simple-tts-mp3');

const handleVocing = async ({ chatId, pageText, articleTitle }) => {
    sendMessage({
        chatId,
        articleTitle,
        audio: await voiceFile(pageText, String(chatId)),
    });
};

const voiceFile = async (text, fileName) => {
    const voicePath = getFilePath(fileName);

    return await createAudioFile(text, voicePath, 'ru');
}

const getFilePath = (fileName) => {
    const dirPath = path.join(__dirname, process.env.COMMON_SOURCE_PATH);

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    return path.join(dirPath, fileName);
}

module.exports = {
    handleVocing
}