const express = require('express');
const router = express.Router();

const TIME_SPAN = 10;


router.get('/:channel', accessTokenValidator, function(req, res) {

  req.app.get('database').getAllMessages(req.params.channel)
    .then((rows) => groupMessagesByUser(rows))
    .then((messages) => res.render('index.ejs', { messages }));

});


function accessTokenValidator(req, res, next) {
  const token = req.query.token;
  const random = req.query.random;

  if (req.app.get('tokenValidator').validateToken(token, random)) {
    return next();
  }
  return res.render('expired.ejs');
}


function groupMessagesByUser(rows) {
  let lastAuthor = null;
  const selected = [];

  let entry;

  for (const row of rows) {

    if (row.user == lastAuthor && parseInt(row.ts) - parseInt(entry.ts) <= TIME_SPAN * 60) {
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
