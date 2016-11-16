
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
  } else if (hours === 1) {
    res.json({
      response_type: 'in_channel',
      text: 'Deleted translations from last hour.'
    });
  } else {
    res.json({
      response_type: 'in_channel',
      text: 'Invalid number of hours.'
    });
  }

}

function recentCommand(req, res) {
  const channel = req.body.channel_id;
  const count = req.body.text;

  req.app.get('database').getRecentMessages(channel, count)
    .then((messages) => {

      const attachments = _formatMessages(messages);

      if (attachments.length !== 0) {
        return res.json({
          attachments: attachments
        });
      } else {
        return res.json({
          text: 'No recent messages or bot is not added to conversation.'
        });
      }

    });

}

function translationsCommand(req, res) {
  const channel = req.body.channel_id;

  req.app.get('database').getRecentMessages(channel, 1)
    .then((messages) => {

      if (messages.length == 0) {
        return res.json({
          text: 'No recent messages or bot is not added to conversation.'
        });
      }

      else {
        const historyURL = req.app.get('baseURL') + req.app.get('historyURL');
        const [token, random] = req.app.get('tokenValidator').generateToken();
        const args = '/' + req.body.channel_id + '?token=' + token + '&random=' + random;

        return res.json({
          text: 'You can view translations ' + historyURL + args
        });
      }

    });

}


function _formatMessages(messages) {
  return messages.map((message) => {
    const element = {
      fallback: message.translation,
      text: message.translation,
      title: message.name,
      mrkdwn_in: ['text'],
      color: message.color
    };

    if (message.translation !== message.text) {
      element.footer = 'Translated';
    }

    return element;
  });
}


module.exports = {
  deleteCommand,
  recentCommand,
  translationsCommand
};
