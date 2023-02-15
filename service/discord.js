const axios = require('axios');
const { Client, Intents, MessageAttachment } = require('discord.js');

async function discordBot(client, token, apiURL, twitterId) {
  client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
  });

  client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'n') {
      const size = interaction.options.get('개수')?.value || 5;

      try {
        const response = await axios.get(
          `${apiURL}/twitter/likes?twitterId=${twitterId}&type=down&size=${Math.max(size, 5)}`
        );

        const data = response.data.url;

        await interaction.deferReply();

        for (let i = 0; i < Math.min(data.length, size); i++) {
          const attachment = new MessageAttachment(data[i]);
          await interaction.followUp({ files: [attachment] });
        }

        await interaction.followUp('가져오기 완료!');
      } catch (error) {
        console.error(error);
        await interaction.followUp(`error ${error.message}`);
      }
    }

    if (interaction.commandName === 'r') {
      try {
        const response = await axios.get(
          `${apiURL}/twitter/likes?twitterId=${twitterId}&type=down&size=5`
        );

        const data = response.data.url;

        const attachment = new MessageAttachment(data[0]);
        await interaction.reply({ files: [attachment] });
      } catch (error) {
        console.error(error);
        await interaction.reply(`error ${error.message}`);
      }
    }

    if (interaction.commandName === 'down') {
      const url = interaction.options.get('url').value;

      try {
        const response = await axios.get(
          `${apiURL}/twitter/likes?twitterId=${twitterId}&type=url&url=${url}`
        );

        const attachment = new MessageAttachment(response.data.url);
        await interaction.reply({ files: [attachment] });
      } catch (error) {
        console.error(error);
        await interaction.reply(`error ${error.message}`);
      }
    }
  });

  await client.login(token);
}

module.exports = discordBot;
