require('dotenv').config({path: '../.env'});
var TranslatorBot = require('./translatorbot')

const bot = new TranslatorBot({
  token: process.env.BOT_TOKEN,
  name: process.env.BOT_NAME
});
