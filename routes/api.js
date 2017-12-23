var express = require('express');
var router = express.Router();

var game = require('../game.js');

router.get('/active_game_id', function(req, res, next) {
  return res.json({gid: game.get_active_game_id()});
});

module.exports = router;
