const axios = require('axios');

async function discordBot(client, token, apiURL, twitterId) {
    client.on('ready', () => {
        console.log(`Logged in as ${client.user.tag}!`);
    });

    client.on('message', async message => {

        console.log("mssage : " + message.content);

        if (message.content.startsWith('!n ')) {
            const size = message.content.split(' ')[1];

            try {
                const response = await axios.get(
                    `${apiURL}/twitter/likes?twitterId=${twitterId}&type=down&size=${Math.max(size, 5)}`
                );

                const data = response.data.url;
                await message.channel.send('가져오는중...');

                for (let i = 0; i < Math.min(data.length, size); i++) {
                    await message.channel.send(data[i]);
                }

                await message.channel.send('가져오기 완료!');
            } catch (error) {
                console.error(error);
                await message.channel.send(`error ${error.message}`);
            }
        }

        if (message.content.startsWith('!r')) {

            try {
                const response = await axios.get(
                    `${apiURL}/twitter/likes?twitterId=${twitterId}&type=down&size=5`
                );

                const data = response.data.url;
                await message.channel.send('가져오는중...');
                await message.channel.send(data[0]);
                await message.channel.send('가져오기 완료!');
            } catch (error) {
                console.error(error);
                await message.channel.send(`error ${error.message}`);
            }

        }

        if (message.content.includes("https://twitter.com/")) {
            try {
                 message.channel.send("다운로드중...");

                const response = await axios.get(
                    `${apiURL}/twitter/likes?twitterId=${twitterId}&type=url&url=${message.content}`
                );

                console.info(response.data.resultMessage);
                message.channel.send(response.data.resultMessage);
            } catch (error) {
                console.error(error);
                await message.channel.send(`error ${error.message}`);
            }

        }


    });

    client.login(token);
}

module.exports = discordBot;
