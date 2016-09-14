const express = require('express');
const router = express.Router();


router.get('/:channel', function(req, res) {

  req.app.get('database').getAllMessages(req.params.channel)
    .then((data) => {
      res.json(data);
    });

});

module.exports = router;
