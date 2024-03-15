const fs = require("node:fs");
const path = require("node:path");
const { sendMessage } = require("./producer");
const { createAudioFile } = require("simple-tts-mp3");
const { supabaseApi } = require("./supabase");

const handleVocing = async ({ chatId, pageText, articleTitle, language }) => {
    const localFilePath = await createFile(pageText, String(chatId), language);
    const fileName = await uploadFile(localFilePath);

    sendMessage({
        chatId,
        articleTitle,
        audioName: fileName,
    });
};

const createFile = async (text, fileName, language) => {
    const filePath = generateFilePath(fileName);

    return await createAudioFile(text, filePath, language);
};

const generateFilePath = (fileName) => {
    const dirPath = path.join(__dirname, process.env.COMMON_SOURCE_PATH);

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    return path.join(dirPath, fileName);
};

const uploadFile = async (localFilePath) => {
    try {
        const stream = fs.createReadStream(localFilePath);
        const fileName = path.basename(localFilePath);
        const data = [];

        stream.on('data', chunk => {
            data.push(chunk);
        })
        stream.on('error', error => {
            throw new Error(error)
        })
        stream.on('end', async () => {
            const bucket = process.env.STORAGE_BUCKET;
            const { error } = await supabaseApi.storage
                .from(bucket).upload(
                    fileName,
                    new Blob(data),
                    { contentType: "Blob" }
                );

            if (error) throw new Error("Ошибка загрузки: ", error);
        });

        return fileName;
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    handleVocing
}