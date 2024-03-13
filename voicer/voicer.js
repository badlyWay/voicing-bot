const fs = require("node:fs");
const path = require("node:path");
const { sendMessage } = require("./producer");
const { createAudioFile } = require("simple-tts-mp3");

const handleVocing = async ({ chatId, pageText, articleTitle, language }) => {
    sendMessage({
        chatId,
        articleTitle,
        audio: await createFile(pageText, String(chatId), language),
    });
};

const createFile = async (text, fileName, language) => {
    const voicePath = generateFilePath(fileName);

    return await createAudioFile(text, voicePath, language);
}

const generateFilePath = (fileName) => {
    const dirPath = path.join(__dirname, process.env.COMMON_SOURCE_PATH);

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    return path.join(dirPath, fileName);
}

module.exports = {
    handleVocing
}