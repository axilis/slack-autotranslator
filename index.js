require('dotenv').config();

const Translator = require('./bot/translator');
const TranslatorBot = require('./bot/translatorBot');
const Database = require('./database');
const WebServer = require('./web/server');

const translator = new Translator({
  clientId: process.env.TRANSLATOR_ID,
  clientSecret: process.env.TRANSLATOR_SECRET,
  guesser: {
    languages: [
      {
        code: 'hr',
        words: ['kaj', 'hrana', 'ili', 'je', 'da', 'jel', 'si', 'mi', 'na', 'sam',
                'su', 'se', 'smo', 'ali', 'te', 'nas', 'naš', 'nasi', 'naši',
                'nase', 'naše', 'kada', 'koji', 'zasto', 'zašto', 'sve', 'sta',
                'šta', 'radi', 'jucer', 'jučer', 'danas', 'sutra', 'nego', 'vec',
                'već', 'ce', 'će', 'cu', 'ću', 'ovo', 'ak', 'ako', 'naime', 'samo'
        ],
        letters: ['ć', 'č', 'š', 'ž', 'đ']
      },
      {
        code: 'en',
        words: ['the', 'be', 'to', 'of', 'and', 'in', 'that', 'have', 'it',
                'for', 'not', 'on', 'with', 'he', 'you', 'at', 'this', 'but',
                'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or',
                'an', 'will', 'my', 'all', 'would', 'there', 'their', 'what',
                'so', 'up', 'if', 'about', 'who', 'get', 'which', 'go',
                'when', 'make', 'can', 'like', 'time', 'just', 'him', 'know'
        ]
      }
    ],
    threshold: 0.1
  }
});

try {
  const db = new Database('../');
  const bot = new TranslatorBot({
    token: process.env.BOT_TOKEN,
    name: process.env.BOT_NAME,
    translator,
    targetLanguage: 'en',
    database: db
  });

  WebServer.set('database', db);
  WebServer.set('historyURL', process.env.BASE_URL + process.env.HISTORY_URL);

  WebServer.set('TOKEN_TRANSLATIONS', process.env.TOKEN_TRANSLATIONS);
  WebServer.set('TOKEN_RECENT', process.env.TOKEN_RECENT);
  WebServer.set('TOKEN_DELETE', process.env.TOKEN_DELETE);

} catch(err) {
  console.error(err);
  process.exit(-1);
}
