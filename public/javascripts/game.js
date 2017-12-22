/*global d3, io, Shake*/
!(function(d3, io, Shake) {

  function initGame(_t) {

    var socket = io.connect('/mobile');

    socket.on('connect', function() {
      var sid = localStorage.getItem('sid');
      if (sid === null) {
        sid = socket.id;
        localStorage.setItem('sid', sid);
      }
      socket.emit('setid', {id: sid, gid: _t});
    });
    socket.on('notify', function(msg) {

    });
    socket.on('setstate', function(msg) {
      console.log(msg);
      var state = null;
      if (msg === null) {
        return;
      }
      if (msg.state !== void 0) {
        state = msg.state;
      } else if (msg.options !== void 0 && msg.options.state !== void 0) {
        state = msg.options.state;
      }
      if (state === null) {
        return;
      }
      if (state === 'readyToJoin') {
        readyToJoin();
      } else if (state === 'playing') {
        d3.selectAll('.box').style('visibility', 'hidden');
        d3.select('#div_game').style('visibility', 'visible');
      } else if (state === 'ended') {
        d3.selectAll('.box').style('visibility', 'hidden');
        d3.select('#div_nogoal').style('visibility', 'visible');
      } else if (state === 'rule') {
        d3.selectAll('.box').style('visibility', 'hidden');
        d3.select('#div_rule').style('visibility', 'visible');
      } else if (state === 'goaled') {
        d3.selectAll('.box').style('visibility', 'hidden');
        d3.select('#div_goal').style('visibility', 'visible');
      } else {
        d3.selectAll('.box').style('visibility', 'hidden');
        d3.select('#div_enter').style('visibility', 'visible');
        d3.select('#input_name').on('change', function() {
          var s = d3.select(this).property('value');
          if (s.length > 8) {
            d3.select(this).property('value', s.substring(0, 8));
          }
        });
        d3.select('#a_join').style('visibility', 'hidden');
      }
    });

    var shake = new Shake({
      threshold: 15,
      timeout: 10
    });

    shake.start();
    d3.select(window).on('shake', function() {
      d3.event.preventDefault();
      socket.emit('move', 1);
      d3.select('#div_game').text('ふれてます');
    });

    function readyToJoin() {
      d3.select('#a_join').style('visibility', 'visible').on('click', function() {
        d3.event.preventDefault();
        var name = d3.select('#input_name').property('value');
        socket.emit('join', {name: name});
      });
      d3.selectAll('.box').style('visibility', 'hidden');
      d3.select('#div_enter').style('visibility', 'visible');
      d3.select('#p_wait').style('visibility', 'hidden');
      d3.select('.box__bg_enter').style('background-image', 'none');
    };
    d3.selectAll('.box').style('visibility', 'hidden');
    d3.select('#div_enter').style('visibility', 'visible');
    this.readyToJoin = readyToJoin;
  }
  this.initGame = initGame;
})(d3, io, Shake);
