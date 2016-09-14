const Message = require('../database').Message;
const Bot = require('slackbots');


const CHANNEL_ACTIONS = [
  'channel_archive',
  'channel_created',
  'channel_deleted',
  'channel_rename',
  'channel_unarchive'
];

const GROUP_ACTIONS = [
  'group_archive',
  'group_close',
  'group_open',
  'group_rename',
  'group_unarchive'
];

const MESSAGE_ACTIONS = [
  'message_changed',
  'message_deleted'
];

function isChannelAction(message) {
  return CHANNEL_ACTIONS.includes(message.type);
}

function isGroupAction(message) {
  return GROUP_ACTIONS.includes(message.type);
}

function isUserAction(message) {
  return message.type === 'user_change';
}

function isMessageAction(message) {
  return message.type === 'message' && MESSAGE_ACTIONS.includes(message.subtype);
}

function isMessage(message) {
  return message.type === 'message' && message.text;
}


class TranslatorBot extends Bot {
  constructor(settings) {
    super(settings);

    this.translator = settings.translator;
    this.targetLanguage = settings.targetLanguage;
    this.db = settings.database;

    this.on('start', this.onStart.bind(this));
    this.on('message', this.onMessage.bind(this));
  }

  onStart() {
    const name = this.name;
    this.user = this.users.filter((user) => {
      return user.name === name;
    })[0];
    console.log(name);
  }

  getUserById(userId) {
    return this.users.filter((user) => user.id == userId)[0];
  }

  onMessage(message) {

    // If event means that something changed, update those resources
    if (isChannelAction(message)) {
      this._api('channels.list').then((channels) => {
        this.channels = channels.channels;
      });
    }
    else if (isGroupAction(message)) {
      this._api('groups.list').then((groups) => {
        this.groups = groups.groups;
      });
    }
    else if (isUserAction(message)) {
      this._api('users.list').then((users) => {
        this.users = users.users;
      });
    }

    // Handle message change actions
    else if (isMessageAction(message)) {
      if (message.subtype === 'message_changed') {
        this.db.deleteMessage(message.channel, message.previous_message);

        // Let it fall trough to normal message handler
        message.message.channel = message.channel;
        message = message.message;
        this.processMessage(message);
      } else if (message.subtype === 'message_deleted') {
        this.db.deleteMessage(message.channel, message.previous_message);
      }
    }

    // It it is only message
    else if (isMessage(message)) {
      this.processMessage(message);
    }
  }

  processMessage(message) {

    this.translator.translate(message.text, this.targetLanguage)
      .then((translated) => {
        const user = this.getUserById(message.user);

        this.db.storeMessage(new Message(
          message.channel,
          message.user,
          user.real_name || '[unknown]',
          '#' + user.color || '#aaaaaa',
          message.text,
          translated,
          message.ts
        ));

      })
      .catch((err) => {
        console.error(err);
      });

  }
}


module.exports = TranslatorBot;
