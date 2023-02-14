const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger-output');
const indexRouter = require('./routes/index');
const twitterBotAPI = require('./routes/twitter');
const authAPI = require('./routes/auth');
const Discord = require('discord.js');
const discordClient = new Discord.Client();
const discordBot = require('./service/discord.js');
const scheduleConfig = require('./service/schedule.js');
const sqlite3 = require('sqlite3');

const { DISCORD_BOT_TOKEN, API_URL, TWITTER_ACCOUNT } = process.env;

const app = express();

app.set('port', process.env.PORT || 3001);

require('dotenv').config();
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json({ strict: false }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const db = new sqlite3.Database('./needon.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the needon database.');
  }
});

const insertDatabase = `
CREATE TABLE IF NOT EXISTS NB_DOWNLOAD_LOG(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT,
  fileName TEXT
)`;

db.serialize(() => {
  db.run(insertDatabase);
});

app.use('/', indexRouter);
app.use('/twitter', twitterBotAPI);
app.use('/auth/', authAPI);
discordBot(discordClient, DISCORD_BOT_TOKEN, API_URL, TWITTER_ACCOUNT);
scheduleConfig(API_URL, TWITTER_ACCOUNT);

app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

const server = app.listen(app.get('port'), () => {
  console.log(`Express server listening on port ${server.address().port}`);
});

module.exports = app;
