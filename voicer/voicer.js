const fs = require("node:fs");
const path = require("node:path");
const kafka = require("./kafka");
const { createAudioFile } = require("simple-tts-mp3");
const { supabaseApi } = require("./supabase");

/** handleVocing function args
 * @param {Object} message - object
 * @param {string} message.chatId - tg chat id
 * @param {string} message.pageText - text for voicing
 * @param {string} message.articleTitle - title of article
 * @param {string} message.language - language for voicing
 */

const handleVocing = async ({ chatId, pageText, articleTitle, language }) => {
    try {
        const localFilePath = await createFile(pageText, String(chatId + +new Date()), language);
        const audioName = await uploadFile(localFilePath);
        await kafka.sendMessage(process.env.VOICER_TOPIC, {
            chatId,
            articleTitle,
            audioName,
        });
    } catch (error) {
        await kafka.sendMessage(process.env.ERROR_TOPIC, {
            chatId,
            error: "Voice process: " + error.toString(),
        });
    }
};

/** createFile function args
 * @param {string} text - text for voicing
 * @param {string} fileName - file name
 * @param {string} language - language for voicing
 * @returns {Promise<string>} local path of the saved file
 */

const createFile = async (text, fileName, language) => {
    const filePath = generateFilePath(fileName);

    return await createAudioFile(text, filePath, language);
};

/** generateFilePath function args
 * @param {string} fileName - file name
 * @returns {string} - local directory file path
 */

const generateFilePath = (fileName) => {
    const dirPath = path.join(__dirname, process.env.COMMON_SOURCE_PATH);

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    return path.join(dirPath, fileName);
};

/** generateFilePath function args
 * @param {string} localFilePath - local file name
 */

const uploadFile = (localFilePath) => new Promise((resolve, reject) => {
    const stream = fs.createReadStream(localFilePath);
    const fileName = path.basename(localFilePath);
    const audioData = [];

    stream.on('data', chunk => {
        audioData.push(chunk);
    });
    stream.on('error', error => {
        reject(new Error(error));
    });
    stream.on('end', async () => {
        const bucket = process.env.STORAGE_BUCKET;
        const { data, error } = await supabaseApi.storage
            .from(bucket).upload(
                fileName,
                new Blob(audioData),
                { contentType: "Blob" }
            );
        resolve(data.path);
        if (error) reject(new Error("Ошибка загрузки: ", error));
    });

});

module.exports = {
    handleVocing
}