const MESSAGE_LIMIT = 80;



const tokenValidator = function(name) {
  return function(req, res, next) {
    if (req.body.token !== req.app.get(name)) {
      return res.json({
        text: 'Bot not configured correctly, please verify command tokens are set.'
      });
    }
    return next();
  };
};



const recentValidator = function(req, res, next) {
  let count = 15;

  if (req.body.text.trim().length != 0) {
    count = parseInt(req.body.text);

    if (isNaN(count)) {
      return res.json({
        text: 'Expected message count as argument.'
      });
    } else if (count > MESSAGE_LIMIT) {
      return res.json({
        text: `Response limited to last ${MESSAGE_LIMIT} messages, due to Slack limits.`
      });
    }

  }

  req.body.text = count;
  return next();
};



const deleteValidator = function(req, res, next) {
  let hours = 1;

  if (req.body.text.trim().length != 0) {
    hours = parseInt(req.body.text);

    if (isNaN(hours)) {
      return res.json({
        text: 'Expected number as argument.'
      });
    }

  }

  req.body.text = hours;
  return next();
};



module.exports = {
  deleteValidator,
  recentValidator,
  tokenValidator
};
