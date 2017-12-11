
var game = {};

var gameState = {
  stopped: 0,
  initialized: 1,
  started: 2
};

var activeSanta = {};

var state = gameState.stopped;

var connection = null;

var unneiSocket = null;
var projSocket = null;
var mobileSockets = {};

var isSocketReady = function() {
  if (unneiSocket === null || projSocket === null) {
    return false;
  }
  return true;
};

game.setUnneiSocket = function(socket) {
  unneiSocket = socket;
  socket.on('initialize', function(msg) {
    sendToProj('initialize', msg);
  });
  socket.on('start', function(msg) {
    sendToProj('start', msg);
  });
  socket.on('santa_move', function(msg) {
    sendToProj('santa_move', msg);
  });
  socket.on('change_scene', function(msg) {
    sendToProj('change_scene', msg);
  });
  socket.on('notify_proj', function(msg) {
    sendToProj('notify', msg);
  });
  socket.on('notify_mobile', function(msg) {
    sendToSanta(msg.id, 'notify', msg);
  });
  return game;
};

game.setProjSocket = function(socket) {
  projSocket = socket;
  socket.on('initialized', function(msg) {
    game.initialize();
  });
  socket.on('started', function(msg) {
    game.start();
  });
  socket.on('finished', function(msg) {
    game.end();
  });
  socket.on('goaled', function(msg) {
    game.goaled(msg.id);
  });
  socket.on('hit_tonakai', function(msg) {
    game.hit_tonakai(msg.id);
  });
  return game;
};

game.setMobileSocket = function(id, socket) {
  mobileSockets[id] = socket;

  socket.on('move', function (msg) {
    game.move(socket.id, 1);
  });
  socket.on('join', function (msg) {
    if (game.join(socket.id, msg)) {
      socket.emit('notify', {
        message: '参加が受け付けられました'
      });
    } else {
      socket.emit('notify', {
        message: '参加が受け付けられませんでした'
      });
    }
  });
  socket.on('glow', function (msg) {
    game.glow(socket.id);
  });

  return game;
};

var sendToProj = function(method, obj) {
  if (projSocket !== null) {
    projSocket.emit(method, {
      method: method,
      options: obj,
      timestamp: new Date().getTime()
    });
  }
};

var sendToSanta = function(method, obj) {
  if (obj.id !== void 0) {
    sendToSantaById(id, method, obj);
  } else if (obj.status !== void 0) {
    sendToSantaByStatus(obj.status, method, obj);
  } else if (obj.broadcast !== void 0 && obj.broadcast) {
    sendToSantaBroadcast(method, obj);
  } else {
    sendToSantaAll(method, obj);
  }
};

var sendToSantaById = function(id, method, obj) {
  if (mobileSockets[id] !== void 0) {
    if (obj.method !== void 0 && obj.options !== void 0 && obj.timestamp !== void 0) {
      mobileSockets[id].emit(method, obj);
    } else {
      mobileSockets[id].emit(method, {
        method: method,
        options: obj,
        timestamp: new Date().getTime()
      });
    }
  }
};

var sendToSantaByStatus = function(status, method, obj) {
  Object.keys(activeSanta).forEach(function(id) {
    if (activeSanta[id].status === status) {
      sendToSantaById(id, method, obj);
    }
  });
};

var sendToSantaAll = function(method, obj) {
  Object.keys(activeSanta).forEach(function(id) {
    sendToSantaById(id, method, obj);
  });
};

var sendToSantaBroadcast = function(method, obj) {
  Object.keys(mobileSockets).forEach(function(id) {
    sendToSantaById(id, method, obj);
  });
}

var sendToUnnei = function(method, obj) {
  if (unneiSocket !== null) {
    if (obj.method !== void 0 && obj.options !== void 0 && obj.timestamp !== void 0) {
      unneiSocket.emit(method, obj);
    } else {
      unneiSocket.emit(method, {
        method: method,
        options: obj,
        timestamp: new Date().getTime()
      });
    }
  }
}

game.join = function(uid, info) {
  if (state !== gameState.initialized) {
    return false;
  }
  try {
    if (activeSanta[uid] !== void 0) {
      return false;
    }
    var obj = {
      id: uid, cnt: 0, name: info.name, color: info.color,
      status: 'playing'
    };
    activeSanta[uid] = obj;
    sendToProj('join', obj)
    return true;
  } catch (e) {
    return false;
  }
};

game.glow = function(id) {
  sendToProj('glow', {id: id});
};

game.isActive = function(uid) {
  return activeSanta[uid] !== void 0;
};

game.move = function(uid, amount) {
  if (state !== gameState.started || activeSanta[uid] === void 0) {
    return;
  }
  activeSanta[uid].cnt += (amount === void 0)?1:amount;
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
    if (activeSanta[k].cnt !== 0 && activeSanta[k].status === 'playing') {
      res[k] = activeSanta[k].cnt;
      activeSanta[k] = 0;
    }
  });
  return res;
};

game.goaled = function(uid) {
  if (state !== gameState.started || activeSanta[uid] === void 0) {
    return;
  }
  activeSanta[uid].state = 'goaled';
  sendToSanta(uid, 'notify', {message: 'ゴールしました！おめでとうございます！！'});
};

game.hit_tonakai = function(uid) {
  if (state !== gameState.started || activeSanta[uid] === void 0) {
    return;
  }
  sendToSanta(uid, 'notify', {message: 'トナカイにぶつかってしまいました'});
}

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
