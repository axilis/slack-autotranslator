const express = require('express');
const router = express.Router();


router.get('/:channel', function(req, res, next) {
  const token = req.query.token;
  const random = req.query.random;

  if (req.app.get('tokenValidator').validateToken(token, random)) {
    return next();
  }
  return res.end('Token expired!');

}, function(req, res) {

  req.app.get('database').getAllMessages(req.params.channel)
    .then((data) => {
      res.json(data);
    });

});

module.exports = router;
