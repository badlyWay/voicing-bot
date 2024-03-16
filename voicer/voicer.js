const fs = require("node:fs");
const path = require("node:path");
const kafka = require("./kafka");
const { createAudioFile } = require("simple-tts-mp3");
const { supabaseApi } = require("./supabase");

const handleVocing = async ({ chatId, pageText, articleTitle, language }) => {
    try {
        const localFilePath = await createFile(pageText, articleTitle, language);
        const audioName = await uploadFile(localFilePath);

        kafka.sendMessage(process.env.VOICER_TOPIC, {
            chatId,
            articleTitle,
            audioName,
        });
    } catch (error) {
        kafka.sendMessage(process.env.ERROR_TOPIC, {
            chatId,
            error
        });
    }
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

const uploadFile = (localFilePath) => new Promise((resolve, reject) => {
    const stream = fs.createReadStream(localFilePath);
    const fileName = path.basename(localFilePath);
    const data = [];

    stream.on('data', chunk => {
        data.push(chunk);
    });
    stream.on('error', error => {
        reject(new Error(error));
    });
    stream.on('end', async () => {
        const bucket = process.env.STORAGE_BUCKET;
        const { error } = await supabaseApi.storage
            .from(bucket).upload(
                fileName,
                new Blob(data),
                { contentType: "Blob" }
            );

        if (error) reject(new Error("Ошибка загрузки: ", error));
    });

    resolve(fileName);
});

module.exports = {
    handleVocing
}