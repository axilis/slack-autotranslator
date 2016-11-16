const TranslatorBot = require('./translator-bot');
const WebApp = require('./web/server');
const Translator = require('./translator');
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
  const storagePeriod = getVariable('DATABASE_CACHE_TIME');
  return new Database(dbPath, storagePeriod);
}

function startDatabaseCleaningService(db) {
  const INTERVAL = 60 * 1000;
  setInterval(() => {
    db.clearOld();
  }, INTERVAL);
}

function createTranslator(secret, guesser) {
  return new Translator({
    credentials: secret,
    guesser: guesser
  });
}


function startSelfRestartingBot(db) {
  let lastRestart = new Date();
  let timeout = 1000;

  const BOT_TOKEN = getVariable('BOT_TOKEN');
  const BOT_NAME = getVariable('BOT_NAME');
  const TARGET_LANGUAGE = getVariable('TARGET_LANGUAGE');

  // const TRANSLATOR_ID = getVariable('TRANSLATOR_ID');
  const TRANSLATOR_SECRET = getVariable('TRANSLATOR_SECRET');

  let guesser = null;
  if (process.env.GUESSER_CONFIG) {
    const GUESSER_CONFIG = getVariable('GUESSER_CONFIG');
    guesser = JSON.parse(fs.readFileSync(GUESSER_CONFIG, 'utf8'));
  }
  const translator = createTranslator(TRANSLATOR_SECRET, guesser);

  function createBot() {
    console.log('Starting bot...');

    function spawnNewBot(err) {
      console.log('Bot died with an error:', err);
      console.log('Bot lasted: ', ((new Date() - lastRestart) / 1000 / 60 / 60).toFixed(2), 'h');

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
        targetLanguage: TARGET_LANGUAGE,
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

function startWebApp(db) {
  WebApp.set('database', db);
  WebApp.set('baseURL', getVariable('BASE_URL'));

  WebApp.set('TOKEN_TRANSLATIONS', getVariable('TOKEN_TRANSLATIONS'));
  WebApp.set('TOKEN_RECENT', getVariable('TOKEN_RECENT'));
  WebApp.set('TOKEN_DELETE', getVariable('TOKEN_DELETE'));

}

module.exports = {
  startWebApp,
  startSelfRestartingBot,
  startDatabaseCleaningService,
  createDatabase
};
