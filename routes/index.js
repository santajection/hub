var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/game/:id', function(req, res, next) {
  res.render('game', { gameid: req.params.id});
});

module.exports = router;
