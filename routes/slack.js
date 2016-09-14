const express = require('express');
const router = express.Router();

const {
  deleteCommand,
  recentCommand,
  translationsCommand
} = require('../controllers/slashCommands');

const {
  deleteValidator,
  recentValidator,
  tokenValidator
} = require('../validators/slashCommands');


// Slack commands are sometimes pinged to verify that SSL works.
router.use(function(req, res, next) {
  if (req.query.ssl_check) {
    return res.end('OK');
  }

  // Close all slack connections.
  res.set('Connection', 'Close');
  return next();
});

router.post('/delete', tokenValidator('TOKEN_DELETE'), deleteValidator, deleteCommand);
router.post('/recent', tokenValidator('TOKEN_RECENT'), recentValidator, recentCommand);
router.post('/translations', tokenValidator('TOKEN_TRANSLATIONS'), translationsCommand);

module.exports = router;
