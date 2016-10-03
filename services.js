const TranslatorBot = require('./bot/translatorBot');
const WebServer = require('./web/server');
const Translator = require('./bot/translator');
const Database = require('./database');

const fs = require('fs');

function getVariable(variable) {
  if (!process.env[variable]) {
    throw new Error(`Missing ${variable} environment variable.`);
  }
  return process.env[variable];
}

function createDatabase() {
  const dbPath = getVariable('DATABASE_PATH');
  return new Database(dbPath);
}

function startDatabaseCleaningService(db) {
  const INTERVAL = 60 * 1000;
  setInterval(function() {
    db.clearOld();
  }, INTERVAL);
}

function createTranslator(id, secret, guesser) {
  return new Translator({
    clientId: id,
    clientSecret: secret,
    guesser: guesser
  });
}


function startSelfRestartingBot(db) {
  let lastRestart = new Date();
  let timeout = 1000;

  const BOT_TOKEN = getVariable('BOT_TOKEN');
  const BOT_NAME = getVariable('BOT_NAME');

  const TRANSLATOR_ID = getVariable('TRANSLATOR_ID');
  const TRANSLATOR_SECRET = getVariable('TRANSLATOR_SECRET');

  let guesser = null;
  if (process.env.GUESSER_CONFIG) {
    const GUESSER_CONFIG = getVariable('GUESSER_CONFIG');
    guesser = JSON.parse(fs.readFileSync(GUESSER_CONFIG, 'utf8'));
  }
  const translator = createTranslator(TRANSLATOR_ID, TRANSLATOR_SECRET, guesser);

  function createBot() {
    console.log('Starting bot...');

    function spawnNewBot(err) {
      console.log('Bot died with an error:', err);
      console.log(new Date() - lastRestart);

      // Automatically increment timeout to prevent API rate limit
      if (new Date() - lastRestart > 2 * timeout) {
        timeout = 1000;
      } else {
        // Limit to about 1 minute longest deplay
        if (timeout < 60000) {
          timeout *= 2;
        }
      }
      lastRestart = new Date();

      setTimeout(() => {
        createBot();
      }, timeout);
    }

    try {
      const bot = new TranslatorBot({
        token: BOT_TOKEN,
        name: BOT_NAME,
        translator,
        targetLanguage: 'en',
        database: db
      });

      bot.on('error', spawnNewBot);
      bot.on('close', spawnNewBot);
    }
    catch(err) {
      spawnNewBot(err);
    }
  }

  createBot();
}

function startWebServer(db) {
  WebServer.set('database', db);
  WebServer.set('baseURL', getVariable('BASE_URL'));

  WebServer.set('TOKEN_TRANSLATIONS', getVariable('TOKEN_TRANSLATIONS'));
  WebServer.set('TOKEN_RECENT', getVariable('TOKEN_RECENT'));
  WebServer.set('TOKEN_DELETE', getVariable('TOKEN_DELETE'));

}

module.exports = {
  startWebServer,
  startSelfRestartingBot,
  startDatabaseCleaningService,
  createDatabase
};
