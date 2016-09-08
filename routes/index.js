var express = require('express');
var router = express.Router();

// All Slack commands are sometimes pinged to verify that SSL works.
router.use(function(req, res) {
  if (req.query.ssl_check) {
    res.status(200).end('OK');
  }
});

router.post('/slack/translations', function(req, res) {
  res.set('Connection', 'close');
  res.status(200).json({
    text: 'http://srolija.com'
  });
});

router.post('/slack/recent', function(req, res) {
  res.set('Connection', 'close');
  res.status(200).json({
    attachments: [
      {
        fallback: 'srolija: this could work great!',
        color: '#0073cb',
        author_name: 'srolija',
        text: 'this could work great!',
        ts: 1472985601
      },
      {
        fallback: 'kof3r: indeed',
        color: '#dad800',
        author_name: 'kof3r',
        text: 'indeed it *appears* _to_ be working fine :)',
        ts: 1472985205
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
