
var Bot = require('slackbots');


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

function isChannelAction(message) {
  return CHANNEL_ACTIONS.includes(message.type);
}

function isGroupAction(message) {
  return GROUP_ACTIONS.includes(message.type);
}

function isUserAction(message) {
  return message.type === 'user_change';
}

function isMessage(message) {
  return message.type === 'message' && message.text;
}


class TranslatorBot extends Bot {
  constructor(settings) {
    super(settings);
    this.on('start', this.onStart);
    this.on('message', this.onMessage);
  }

  onStart() {
    const name = this.name;
    this.user = this.users.filter((user) => {
      return user.name === name;
    })[0];
    console.log(name);
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

    // It it is only message
    else if (isMessage(message)) {
      this.processMessage(message);
    }
  }

  processMessage(message) {
    if (message.subtype) {
      // it is certainly on english
    }
    console.log(message);
  }
}


module.exports = TranslatorBot;
