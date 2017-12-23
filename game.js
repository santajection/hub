
var game = {};

var gameState = {
  stopped: 0,
  initialized: 1,
  started: 2
};

var activeSanta = {};
var activeGameID = null;

var state = gameState.stopped;

var unneiSocket = null;
var projSocket = null;
var mobileSockets = {};
var gameIdIdsMap = {};

game.get_active_game_id = function() {
  return activeGameID;
};

function isSocketReady() {
  if (unneiSocket === null || projSocket === null) {
    return false;
  }
  return true;
}


game.setUnneiSocket = function(socket) {
  unneiSocket = socket;
  socket.on('initialize', function(msg) {
    if (msg !== null && msg.active_game_id !== void 0) {
      activeGameID = msg.active_game_id;
    } else {
      activeGameID = 0;
    }
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
  socket.on('sound', function(msg) {
    sendToProj('sound', msg);
  });
  return game;
};

game.setProjSocket = function(socket) {
  projSocket = socket;
  socket.on('initialized', function() {
    game.initialize();
  });
  socket.on('started', function() {
    game.start();
  });
  socket.on('ended', function() {
    game.end();
  });
  socket.on('finished', function() {
    game.end();
  });
  socket.on('goaled', function(msg) {
    game.goaled(msg.id);
  });
  socket.on('hit_tonakai', function(msg) {
    game.hit_tonakai(msg.id);
  });
  socket.on('sound', function(msg) {
    sendToUnnei('sound', msg);
  });
  return game;
};

game.setMobileSocket = function(socket) {
  socket.on('setid', function(_) {
    var id = _.id;
    mobileSockets[id] = socket;
    if (gameIdIdsMap[_.gid] === void 0) {
      gameIdIdsMap[_.gid] = [];
    }
    Object.keys(gameIdIdsMap).forEach(function(gid) {
      if (gid === _.gid) {
        if (!gameIdIdsMap[gid].some(function(d) {return d === id;})) {
          gameIdIdsMap[gid].push(id);
        }
      } else {
        var idx = gameIdIdsMap[gid].indexOf(id);
        if (idx !== -1) {
          gameIdIdsMap[gid].splice(idx, 1);
        }
      }
    });
    socket.on('move', function () {
      game.move(id, 1);
    });
    socket.on('join', function (msg) {
      if (game.join(id, msg)) {
        sendToSantaById(id, 'setstatus', {state: 'rule'});
      } else {
        sendToSantaById(id, 'notify', {message: '参加が受付できませんでした'});
      }
    });
    socket.on('glow', function () {
      game.glow(id);
    });
    if (state === gameState.stopped) {
      if (activeSanta[id] !== void 0) {
        if (activeSanta[id].state === 'goaled') {
          sendToSantaById(id, 'setstate', {state: 'goaled'});
        } else {
          sendToSantaById(id, 'setstate', {state: 'ended'});
        }
      } else {
        sendToSantaById(id, 'setstate', {state: 'wait'});
      }
    } else if (state === gameState.initialized) {
      if (_.gid === activeGameID) {
        if (activeSanta[id] !== void 0) {
          sendToSantaById(id, 'setstate', {state: 'rule'});
        } else {
          sendToSantaById(id, 'setstate', {state: 'readyToJoin'});
        }
      } else {
        sendToSantaById(id, 'setstate', {state: 'wait'});
      }
    } else {
      if (activeSanta[id] !== void 0) {
        sendToSantaById(id, 'setstate', {state: activeSanta[id].state});
      } else {
        sendToSantaById(id, 'setstate', {state: 'wait'});
      }
    }
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
    sendToSantaById(obj.id, method, obj);
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

var sendToSantaByGameId = function(gid, method, obj) {
  if (gameIdIdsMap[gid] !== void 0) {
    gameIdIdsMap[gid].forEach(function(id) {
      sendToSantaById(id, method, obj);
    });
  }
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
    if (info.gid != activeGameID) {
      return false;
    }
    if (activeSanta[uid] !== void 0) {
      return true;
    }
    var color = ['red', 'blu', 'yel', 'gre'][Object.keys(activeSanta).length % 4];
    var obj = {
      id: uid, cnt: 0, name: info.name, color: color,
      status: 'playing'
    };
    console.log('================JOINING=============');
    console.log(obj);
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
  sendToSantaAll('setstate', {state: 'ready'});
  console.log(activeSanta);
  main();
};

game.initialize = function() {
  console.log('initialized');
  activeSanta = {};
  state = gameState.initialized;
  idle();
};

game.end = function() {
  state = gameState.stopped;
  if (gameIdIdsMap[activeGameID] !== void 0) {
    gameIdIdsMap[activeGameID].forEach(function(id) {
      if (activeSanta[id] !== void 0 && activeSanta[id].state !== 'goaled') {
        sendToSantaById(id, 'setstate', {state: 'ended'});
      }
    });
  }
};

game.emit = function() {
  var res = {};
  Object.keys(activeSanta).forEach(function(k) {
    if (activeSanta[k].cnt !== 0 && activeSanta[k].status === 'playing') {
      res[k] = activeSanta[k].cnt;
      activeSanta[k].cnt = 0;
    }
  });
  console.log(res);
  return res;
};

game.goaled = function(uid) {
  if (state !== gameState.started || activeSanta[uid] === void 0) {
    return;
  }
  activeSanta[uid].state = 'goaled';
  sendToSantaById(uid, 'setstate', {state: 'goaled'});
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

function idle() {
  if (state !== gameState.initialized) {
    return;
  }
  if (gameIdIdsMap[activeGameID] !== void 0) {
    gameIdIdsMap[activeGameID].forEach(function(id) {
      if (activeSanta[id] === void 0) {
        sendToSantaById(id, 'setstate', {state: 'readyToJoin'});
      } else {
        sendToSantaById(id, 'setstate', {state: 'rule'});
      }
    });
  }
  setTimeout(idle, 1000);
}

function main() {
  if (state !== gameState.started) {
    return;
  }
  sendToProj('mobile_move', game.emit());
  setTimeout(main, 1000);
}

module.exports = game;
