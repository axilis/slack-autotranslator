# slack-autotranslator

This combination of Slack bot and slash commands enables an **unobtrusive way to translate conversations** to a single language. Rather than the usual approach of bot that translates messages and outputs them to everyone this self-hosted integration translates and stores messages so when needed one can get translation in the same channel privately.

## Usage
Simply add bot to a conversation and from now on it will read and translate messages.
Then using three slash commands (names are user-defined) get information you want:

- `/recent [count] ` - outputs translations for given number of messages (up to 60)
- `/translated` - outputs link to page containing all stored messages (up to 24h)
- `/delete [hours]` - deletes messages from last given number of hours to prevent storage of sensitive information

*To comply with Slack API TOS, a command is offered to clear data manually and data storage interval is configurable. It is also made to be self-hosted so your conversations are not available to the third party.*

## Features
- translations are **visible only to individuals who need them**
- translation is updated when a user edits or deletes the message
- powered by Microsoft Translator Text API which supports many languages and offers a free plan with 2,000,000 characters/month
- contains optional language guesser which attempts to detect language based on provided keywords to avoid hitting Translator detection API when not needed
- made to be run 24/7 (automatically restarts to prevent SSL expiration with free certificates, automatically reconnects after network outages)

---

# Configuration

### Prerequisites
- server with Node 6.x or newer due to ES6 syntax
- valid domain and signed SSL certificate (works with free Letsencrypt certificates)
- Microsoft Azure account

### Microsoft Translator API

1. On Azure Portal select add New
2. Select Intelligence -> Cognitive Services API
3. For type select Translator Text
4. Create instance
5. Click on newly created resource and copy one of keys

### Slack integrations

1. While logged into your Slack account click on team name -> Apps & integrations
2. Click on Build -> Make a custom integration
3. Add a bot and copy its API token
4. Create all slash commands and copy their tokens.

Following are examples for each command. Command names do not need to be same as in examples, but URLs should.

```
Command: /translations
URL: https://<server url>:<port>/slack/translations
Method: POST
Name: All translations
Help text: Outputs link to translated messages
Usage hint:
Descriptive label: Shows link to translated version of channel.
```

```
Command: /recent
URL: https://<server url>:<port>/slack/recent
Method: POST
Name: Recent translations
Help text: Displays recent messages along with translations
Usage hint: [message count, by default 3]
Descriptive label: Shows translations for recent messages in current channel.
```

```
Command: /delete
URL: https://<server url>:<port>/slack/delete
Method: POST
Name: Delete translations
Help text: Deletes stored translations for current channel.
Usage hint: [number of hours]
Descriptive label: Deletes stored data from translations.
```

### Bot configuration
Bot requires `.env` file with configuration and optionally guesser configuration file.

```
SSL_KEY=/etc/letsencrypt/live/yourdomain.com/privkey.pem
SSL_CERT=/etc/letsencrypt/live/yourdomain.com/fullchain.pem
SSL_CA=/etc/letsencrypt/live/yourdomain.com/chain.pem

PRODUCTION=true

PORT=1234
TOKEN_TRANSLATIONS=TokenProvidedBySlackForThisCommand
TOKEN_RECENT=TokenProvidedBySlackForThisCommand
TOKEN_DELETE=TokenProvidedBySlackForThisCommand

BOT_TOKEN="xoxb-tokenProvided-bySlackOnBotPage"
BOT_NAME=translator
TARGET_LANGUAGE=en

TRANSLATOR_SECRET="keyProvidedByAzureCognitiveServices"

BASE_URL="https://yourdomain.com:1234"
HISTORY_URL="/history"
GUESSER_CONFIG="../def.json"
DATABASE_PATH="../data.db"
DATABASE_CACHE_TIME=24
```

- Required `SSL` fields depend on certificate type and issuer therefore not all require `SSL_CA`. When using Letsencrypt or similar free certificate ensure that certificate is automatically updated upon expiration (in case of Letsencrypt every 3 months).
- `DATABASE_CACHE_TIME` determines how long is data stored by bot so it could be retrieved translated.
- `GUESSER_CONFIG` is not required but using it requires to create language guesser configuration.

Example configuration for guessing language, `def.json` in this case of aforementioned configuration:

```
{
  "languages": [
    {
      "code": "hr",
      "words": ["kaj", "ili", "je", "da", "jel", "si", "mi", "na", "sam",
              "su", "se", "smo", "ali", "te", "nas", "naš", "nasi", "naši",
              "nase", "naše", "kada", "koji", "zasto", "zašto", "sve", "sta",
              "šta", "radi", "jucer", "jučer", "danas", "sutra", "nego", "vec",
              "već", "ce", "će", "cu", "ću", "ovo", "ak", "ako", "naime", "samo"
      ],
      "letters": ["ć", "č", "š", "ž", "đ"]
    },
    {
      "code": "en",
      "words": ["the", "be", "to", "of", "and", "in", "that", "have", "it",
              "for", "not", "on", "with", "he", "you", "at", "this", "but",
              "his", "by", "from", "they", "we", "say", "her", "she", "or",
              "an", "will", "my", "all", "would", "there", "their", "what",
              "so", "up", "if", "about", "who", "get", "which", "go",
              "when", "make", "can", "like", "time", "just", "him", "know"
      ]
    }
  ],
  "threshold": 0.1
}
```

*When creating guesser configuration keep in mind to only use words and letters that
are mutually language exclusive.*

### Running bot

After creating required configuration on the server simply start it as a daemon. Probably the easiest way to do it is using [forever](https://www.npmjs.com/package/forever) package. If you are experiencing problems, make sure that process has appropriate permissions to access SSL certificates and that firewall isn't blocking given port (some cloud providers require special ports to be manually allowed in their control panel).
