var express = require('express');
var router = express.Router();


// Slack commands are sometimes pinged to verify that SSL works.
router.use(function(req, res, next) {
  if (req.query.ssl_check) {
    res.status(200).end('OK');
  } else {
    next();
  }
});


router.post('/translations', function(req, res) {
  res.set('Connection', 'close');
  res.status(200).json({
    text: 'You can view translations'
  });
});


router.post('/recent', function(req, res) {
  res.set('Connection', 'close');
  res.status(200).json({
    attachments: [
      {
        fallback: 'Required plain-text summary of the attachment.',
        color: '#944348',
        title: 'srolija',
        text: 'Optional text that *appears* _within_ the attachment',
        mrkdwn_in: ['text']
      },
      {
        fallback: 'Required plain-text summary of the attachment.',
        color: '#944348',
        text: 'Optional text that *appears* _within_ the attachment',
        mrkdwn_in: ['text']
      },
      {
        title: '@srolija',
        fallback: 'Required plain-text summary of the attachment.',
        color: '#82e087',
        text: 'Optional text that *appears* _within_ the attachment',
        mrkdwn_in: ['text']
      }
    ]
  });
});


router.post('/slack/delete', function(req, res) {
  res.set('Connection', 'close');

  if (req.body.text >= 2) {
    res.status(200).json({
      response_type: 'in_channel',
      text: 'Sergej deleted translations from last 2 hours.'
    });
  } else {
    res.status(200).json({
      response_type: 'in_channel',
      text: 'Sergej deleted translations from last hour.'
    });
  }

});

module.exports = router;
