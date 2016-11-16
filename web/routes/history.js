const express = require('express');
const router = express.Router();

const HISTORY_SPAN = 10;


router.get('/:channel', _accessTokenValidatorMiddleware, (req, res) => {
  req.app.get('database').getAllMessages(req.params.channel)
    .then((rows) => _groupMessagesByUser(rows))
    .then((messages) => res.render('index.ejs', { messages }));
});


function _accessTokenValidatorMiddleware(req, res, next) {
  const token = req.query.token;
  const random = req.query.random;

  if (req.app.get('tokenValidator').validateToken(token, random)) {
    return next();
  }
  return res.render('expired.ejs');
}


function _groupMessagesByUser(rows) {
  const selected = [];
  let lastAuthor = null;
  let entry;

  for (const row of rows) {

    if (row.user === lastAuthor && parseInt(row.ts, 10) - parseInt(entry.ts, 10) <= HISTORY_SPAN * 60) {
      entry.text += '\n' + row.text;
      entry.translation += '\n' + row.translation;
    } else {
      lastAuthor = row.user;
      entry = row;
      selected.push(entry);
    }

  }
  return selected;
}

module.exports = router;
