
var game = {};

var gameState = {
  stopped: 0,
  initialized: 1,
  started: 2
};

var activeSanta = {};

var state = gameState.stopped;

var connection = null;

game.join = function(uid) {
  if (state !== gameState.initialized) {
    return;
  }
  activeSanta[uid] = 0;
  return uid;
};

game.isActive = function(uid) {
  return activeSanta[uid] !== void 0;
};

game.move = function(uid, amount) {
  if (state !== gameState.started || activeSanta[uid] === void 0) {
    return;
  }
  activeSanta[uid] += (amount === void 0)?1:amount;
};

game.start = function() {
  console.log('started');
  state = gameState.started;
  console.log(activeSanta);
  main();
};

game.initialize = function() {
  console.log('initialized');
  activeSanta = {};
  state = gameState.initialized;
};

game.end = function() {
  state = gameState.stopped;
};

game.emit = function() {
  var res = {};
  Object.keys(activeSanta).forEach(function(k) {
    if (activeSanta[k] !== 0) {
      res[k] = activeSanta[k];
      activeSanta[k] = 0;
    }
  });
  return res;
};

game.connect = function(io) {
  connection = io;
};

function main() {
  if (state !== gameState.started) {
    return;
  }
  if (connection != null) {
    connection.emit('mobile_move', {
      method: 'mobile_move',
      options: game.emit(),
      timestamp: new Date().getTime()
    });
  }
  setTimeout(main, 1000);
};

module.exports = game;
