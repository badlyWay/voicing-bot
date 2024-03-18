const https = require("node:https");
const { parse } = require("node-html-parser");
const kafka = require("./kafka");

/** handlePageParse function args
 * @param {Object} message - tg chat id
 * @param {string} message.chatId - tg chat id
 * @param {string} message.url - page url for parse
 */

const handlePageParse = async ({ chatId, url }) => {
    try {
        const body = await fetch(url);
        const page = parse(body);

        await kafka.sendMessage(process.env.BUFFER_TOPIC, {
            chatId,
            pageText: page.querySelector("article").textContent,
            articleTitle: page.querySelector("h1").textContent,
            language: page.querySelector("html").getAttribute("lang"),
        });
    } catch (error) {
        await kafka.sendMessage(process.env.ERROR_TOPIC, {
            chatId,
            error: "Parse process: " + error.toString(),
        });
    }
};

/** fetch function args
 * @param {string} url - page url ('https://...')
 * @returns {Promise<string>} response
 */

const fetch = (url) => new Promise((resolve, reject) => {
    const request = https.request(url, (res) => {
        res.setEncoding("utf8");

        const data = [];

        res.on("data", (chunk) => {
            data.push(chunk);
        });
        res.on("error", (error) => {
            reject(error);
        });
        res.on("end", async () => {
            resolve(String(data));
        });
    });

    request.on("error", (error) => {
        reject(error);
    });
    request.end();
});

module.exports = {
    handlePageParse,
}