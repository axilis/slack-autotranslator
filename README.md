# slack-autotranslator

This combination of Slack bot and slash commands enables a unintrusive way to translate conversations to a single language. Rather than the usual approach of bot that translates messages and outputs them to everyone this self hosted integration translates and stores messages so when needed one can get translation in the same channel privately.

It works by adding bot to conversation and offers users three slash commands (names are user-defined):

- `/recent [count] ` - outputs translations for given number of messages (up to 60)
- `/translated` - outputs link to page containing all stored messages (up to 24h)
- `/delete [hours]` - deletes messages from last given number of hours to prevent storage of sensitive information

To comply with Slack API TOS, offers command to clear data manually and this data storage should not exceed 24h. It is also made to be self-hosted so your conversations are not available to third party.

## Features
- implements latest Microsoft Translate API
- translations are visible only to individuals who need them
- translation is updated when a user edits or deletes the message
- powered by Microsoft Translator which supports many languages and offers 2,000,000 characters/month translated for free
- contains optional language guesser which attempts to detect language based on provided keywords to avoid hitting Translator detection API when not needed
- made to be run 24/7 (automatically restarts to avoid SSL expiration with Letsencrypt certificates, automatically reconnects after network outages)

## Configuration

### Prerequisites
- server with Node 6.x
- valid domain and SSL certificate
- Microsoft Translate API client id and secret

### Configuring bot
- general
- language guesser

## ENV example
## Definition example

### Configuring slack

## Usage
/recent
/translations
/delete
