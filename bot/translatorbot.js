const Bot = require('slackbots');
const Message = require('../database/models').Message;

const {
  isChannelAction,
  isGroupAction,
  isUserAction,
  isMessageAction,
  isMessage
} = require('./utilities/messageActions');


const DEFAULT_COLOR = '#aaaaaa';
const DEFAULT_NAME = '[unknown]';


class TranslatorBot extends Bot {

  constructor(settings) {
    super(settings);

    this.translator = settings.translator;
    this.targetLanguage = settings.targetLanguage;
    this.db = settings.database;

    this.on('message', this.eventHandler.bind(this));
  }

  eventHandler(event) {

    // If event means that something changed, update those resources
    if (isChannelAction(event)) {
      this._api('channels.list').then((channels) => {
        this.channels = channels.channels;
      });
    }
    else if (isGroupAction(event)) {
      this._api('groups.list').then((groups) => {
        this.groups = groups.groups;
      });
    }
    else if (isUserAction(event)) {
      this._api('users.list').then((users) => {
        this.users = users.members;
      });
    }

    else if (isMessageAction(event)) {
      this._handleMessageChangeAction(event);
    }

    else if (isMessage(event)) {
      this._translateAndStore(event);
    }
  }

  _handleMessageChangeAction(event) {

    switch(event.subtype) {
    case 'message_changed':
      this._updateMessage(event);
      break;

    case 'message_deleted':
      this.db.deleteMessage(event.channel, event.previous_message);
      break;
    }

  }

  _updateMessage(event) {
    // Delete old message
    this.db.deleteMessage(event.channel, event.previous_message);

    // Translate and store updated version of message
    const message = event.message;
    message.channel = event.channel;
    this._translateAndStore(message);
  }

  // Get user by id from local cache
  _getUserById(userId) {
    return this.users.filter((user) => user.id == userId)[0];
  }

  _translateAndStore(message) {

    this.translator.translate(message.text, this.targetLanguage)
      .then((translation) => {

        const user = this._getUserById(message.user);
        const processedMessage = new Message({
          channel: message.channel,
          user: message.user,
          name: user.real_name || DEFAULT_NAME,
          color: '#' + user.color || DEFAULT_COLOR,
          text: message.text,
          translation: translation,
          ts: message.ts
        });

        this.db.storeMessage(processedMessage);
      })
      .catch((err) => {
        console.error(err);
      });

  }

}


module.exports = TranslatorBot;
