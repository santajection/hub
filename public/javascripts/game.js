!(function(d3, io, Shake) {
<<<<<<< HEAD
=======
  var socket = io.connect('/mobile');
>>>>>>> 48e654e0c831746075b1ca041f77faccd7565ec3

  function initGame(_t) {

<<<<<<< HEAD
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
      if (msg.state === 'readyToJoin') {
        readyToJoin();
      } else if (msg.state === 'playing') {
        d3.selectAll('.box').style('visibility', 'hidden');
        d3.select('#div_game').style('visibility', 'visible');
      } else if (msg.state === 'ended') {
        d3.selectAll('.box').style('visibility', 'hidden');
        d3.select('#div_nogoal').style('visibility', 'visible');
      } else if (msg.state === 'rule') {
        d3.selectAll('.box').style('visibility', 'hidden');
        d3.select('#div_rule').style('visibility', 'visible');
      } else if (msg.state === 'goaled') {
        d3.selectAll('.box').style('visibility', 'hidden');
        d3.select('#div_goal').style('visibility', 'visible');
      } else {

      }
    });

=======
  function initGame() {
>>>>>>> 48e654e0c831746075b1ca041f77faccd7565ec3
    d3.select('#input_name').on('change', function() {
      var s = d3.select(this).property('value');
      if (s.length > 8) {
        d3.select(this).property('value', s.substring(0, 8));
      }
    });
<<<<<<< HEAD
    d3.select('#a_join').style('visibility', 'hidden');
=======
    d3.select('#a_join').on('click', function() {
      d3.event.preventDefault();
      var name = d3.select('#input_name').property('value');
      socket.emit('join', {name: name});
      d3.selectAll('.box').style('visibility', 'hidden');
      d3.select('#div_rule').style('visibility', 'visible');
    });
>>>>>>> 48e654e0c831746075b1ca041f77faccd7565ec3
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

<<<<<<< HEAD
    function readyToJoin() {
      d3.select('#a_join').style('visibility', 'visible').on('click', function() {
        d3.event.preventDefault();
        var name = d3.select('#input_name').property('value');
        socket.emit('join', {name: name});
        d3.selectAll('.box').style('visibility', 'hidden');
        d3.select('#div_rule').style('visibility', 'visible');
      });
      d3.select('#p_wait').style('visibility', 'hidden');
//      d3.select('.box__bg_enter').style('background-image', 'url(/images/introduction1.gif)');
      d3.select('.box__bg_enter').style('background-image', 'none');
    };
    d3.select('#div_enter').style('visibility', 'visible');
    this.readyToJoin = readyToJoin;
=======
>>>>>>> 48e654e0c831746075b1ca041f77faccd7565ec3
  }
  this.initGame = initGame;
})(d3, io, Shake);
