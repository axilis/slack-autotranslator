
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


module.exports = {
  isChannelAction,
  isGroupAction,
  isUserAction,
  isMessageAction,
  isMessage
};
