const schedule = require('node-schedule');
const express = require("express");
const axios = require('axios');

const env = process.env.NODE_ENV || 'production';

async function scheduleConfig(apiURL, twitterId) {

  if (env === 'development') {
    return;
  }

  const app = express();

  const router = express.Router();
  app.use(router);

  app.listen(function () {
    schedule.scheduleJob('0 0 13 * * ?', async function () {
      try {
        const response = await axios.get(
          `${apiURL}/twitter/likes?twitterId=${twitterId}&type=down&size=50`
        );
        console.log(response.data);
      } catch (error) {
        console.error(error);
      }
    });

    schedule.scheduleJob('0 0 1 * * ?', async function () {
      try {
        const response = await axios.get(
          `${apiURL}/twitter/likes?twitterId=${twitterId}&type=down&size=50`
        );
        console.log(response.data);
      } catch (error) {
        console.error(error);
      }
    });
  });
}

module.exports = scheduleConfig;
