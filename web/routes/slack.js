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


// Middleware that handles typical problems that slack commands can experience.
router.use((req, res, next) => {

  // Slack commands are sometimes pinged to verify that SSL works.
  if (req.query.ssl_check) {
    return res.end('OK');
  }

  // Prevent persistent HTTP connection.
  res.set('Connection', 'Close');

  // Wrap call of slack functions so user gets nice message
  try {
    return next();
  } catch(err) {
    console.error(err);
    return res.json({
      text: 'There was an error while executing command. Please check server logs.'
    });
  }
});

router.post('/delete', tokenValidator('TOKEN_DELETE'), deleteValidator, deleteCommand);
router.post('/recent', tokenValidator('TOKEN_RECENT'), recentValidator, recentCommand);
router.post('/translations', tokenValidator('TOKEN_TRANSLATIONS'), translationsCommand);

module.exports = router;
