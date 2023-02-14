const request = require('request');
const fs = require('fs');

async function download(url, dest) {
    const file = fs.createWriteStream(dest);
    const stream = request({ uri: url, gzip: true });

    stream.pipe(file);

    await new Promise((resolve, reject) => {
        file.on('finish', resolve);
        stream.on('error', reject);
        file.on('error', reject);
    });

    console.info(`${url} finished downloading.`);
}

module.exports = { download };
