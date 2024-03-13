const https = require('node:https');
const { parse } = require('node-html-parser');
const { sendMessage } = require("./producer");

const handlePageParse = async ({ chatId, url }) => {
    const { body } = await fetch(url);

    sendMessage({
        chatId,
        pageText: parse(body).querySelector('article').textContent,
        articleTitle: parse(body).querySelector('h1').textContent,
    });
};

const fetch = (url) => new Promise((resolve, reject) => {
    const request = https.request(url, (res) => {
        res.setEncoding('utf8');

        const data = [];

        res.on('data', (chunk) => {
            data.push(chunk);
        });
        res.on('error', (error) => {
            reject(error)
        });
        res.on('end', async () => {
            resolve({
                body: String(data)
            });
        });
    });

    request.on('error', (error) => {
        reject(error)
    });
    request.end();
});

module.exports = {
    handlePageParse
}