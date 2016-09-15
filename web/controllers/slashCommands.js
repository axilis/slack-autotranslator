
function deleteCommand(req, res) {

  const hours = req.body.text;
  const channel = req.body.channel_id;

  const now = (new Date()).getTime();
  const time = now - 1000 * 3600 * hours;
  const since = new Date(time);

  req.app.get('database').clearMessages(channel, since);

  if (hours >= 2) {
    res.json({
      response_type: 'in_channel',
      text: `Deleted translations from last ${hours} hours.`
    });
  } else {
    res.json({
      response_type: 'in_channel',
      text: 'Deleted translations from last hour.'
    });
  }

}


function formatMessages(messages) {
  let lastAuthor = null;
  const attachments = [];

  let entry;

  for (const message of messages) {

    if (message.user != lastAuthor) {
      lastAuthor = message.user;
      entry = {
        fallback: message.translation,
        text: message.translation,
        title: message.name,
        mrkdwn_in: ['text'],
        color: message.color
      };
      attachments.push(entry);
    } else {
      // Append to last message
      entry.fallback += '\n' + message.translation;
      entry.text += '\n' + message.translation;
    }

  }
  return attachments;
}

function recentCommand(req, res) {
  const channel = req.body.channel_id;
  const count = req.body.text;

  req.app.get('database').getRecentMessages(channel, count)
    .then((messages) => {

      const attachments = formatMessages(messages);

      if (attachments.length !== 0) {
        return res.json({
          attachments: attachments
        });
      } else {
        return res.json({
          text: 'No messages stored yet.'
        });
      }

    })
    .catch((err) => {
      console.error(err);
      return res.json({
        text: 'There was an error while executing command. Please check server logs.'
      });
    });

}


function translationsCommand(req, res) {
  const historyURL = req.app.get('historyURL');
  const [token, random] = req.app.get('tokenValidator').generateToken();
  const args = '/' + req.body.channel_id + '?token=' + token + '&random=' + random;

  res.json({
    text: 'You can view translations ' + historyURL + args
  });
}


module.exports = {
  deleteCommand,
  recentCommand,
  translationsCommand
};
