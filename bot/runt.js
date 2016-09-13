require('dotenv').config({path: '../.env'});

const Translator = require('./translator');

const t = new Translator({
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

t.translate("Hello, what are you doing?", 'hr').then((data) => {
  console.log(data);
}).catch((err) => {
  console.log(err);
});
