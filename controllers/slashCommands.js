
const deleteCommand = function(req, res) {

  const hours = req.body.text;
  const channel = req.body.channel_id;
  const since = new Date((new Date()).getTime() - 3600 * 1000 * hours);

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

};



const formatMessages = function(messages) {
  let lastAuthor = null;
  const attachments = [];

  for (const message of messages) {
    const entry = {
      fallback: message.translation,
      text: message.translation,
      mrkdwn_in: ['text'],
      color: message.color
    };

    if (message.user != lastAuthor) {
      lastAuthor = message.user;
      entry.title = message.name;
    }

    attachments.push(entry);
  }
  return attachments;
};


const recentCommand = function(req, res) {
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

};



const translationsCommand = function(req, res) {
  const historyURL = req.app.get('historyURL');
  const args = '/' + req.body.channel_id + '?token=' + req.body.token;

  res.json({
    text: 'You can view translations ' + historyURL + args
  });
};



module.exports = {
  deleteCommand,
  recentCommand,
  translationsCommand
};
