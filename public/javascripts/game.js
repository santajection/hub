/*global d3, io, Shake*/
!(function(d3, io, Shake) {

  function initGame(_t) {

    function setScreen(divid) {
      d3.selectAll('.box').style('visibility', 'hidden');
      d3.select(divid).style('visibility', 'visible');
      if (divid !== '#div_enter') {
        d3.select('#p_wait').style('visibility', 'hidden');
        d3.select('#a_join').style('visibility', 'hidden');
      }
      d3.select('#div_notify').style('visibility', 'visible');
    }
    function setScreenWait() {
      setScreen('#div_enter');
      d3.select('#p_wait').style('visibility', 'visible');
      d3.select('#a_join').style('visibility', 'hidden');
      d3.select('.box__bg_enter').style('background-image', 'url(/images/introduction4.gif)');
    }
    this.setScreenWait = setScreenWait;
    function setScreenReadyToJoin() {
      setScreen('#div_enter');
      d3.select('#p_wait').style('visibility', 'hidden');
      d3.select('#a_join').style('visibility', 'visible');
      d3.select('.box__bg_enter').style('background-image', 'none');
    }
    this.setScreenReadyToJoin = setScreenReadyToJoin;
    function setScreenRule() {
      setScreen('#div_rule');
    }
    this.setScreenRule = setScreenRule;
    function setScreenReady() {
      setScreen('#div_ready');
      setTimeout(setScreenGame, 2000);
    }
    this.setScreenReady = setScreenReady;
    function setScreenGame() {
      setScreen('#div_game');
    }
    this.setScreenGame = setScreenGame;
    function setScreenEnded() {
      setScreen('#div_nogoal');
    }
    this.setScreenEnded = setScreenEnded;
    function setScreenGoal() {
      setScreen('#div_goal');
    }
    this.setScreenGoal = setScreenGoal;
    function popNotificationInfo(s) {
      d3.select('#div_notify').insert('div', 'div')
        .attr('class', 'alert alert-info')
        .style('opacity', 0.9)
        .text(s)
        .transition()
        .delay(2000.0)
        .duration(1000.0)
        .style('opacity', 0.0).remove();
    }
    this.popNotificationInfo = popNotificationInfo;

    // DOM functionalities
    d3.select('#input_name').on('change', function() {
      var s = d3.select(this).property('value');
      if (s.length > 8) {
        d3.select(this).property('value', s.substring(0, 8));
      }
    });

    d3.select('#a_join').style('visibility', 'visible').on('click', function() {
      d3.event.preventDefault();
      var name = d3.select('#input_name').property('value');
      socket.emit('join', {name: name, gid: _t});
    });

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
      var s = '';
      if (msg !== null) {
        if (msg.message !== void 0) {
          s = msg.message;
        } else if (msg.options !== void 0 && msg.options.message !== void 0) {
          s = msg.options.message;
        }
      }
      popNotificationInfo(s);
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
      if (state === 'wait') {
        setScreenWait();
      } else if (state === 'readyToJoin') {
        setScreenReadyToJoin();
      } else if (state === 'rule') {
        setScreenRule();
      } else if (state === 'ready') {
        setScreenReady();
      } else if (state === 'playing') {
        setScreenGame();
      } else if (state === 'ended') {
        setScreenEnded();
      } else if (state === 'goaled') {
        setScreenGoal();
      } else {
        popNotificationInfo('?: setstate(' + state + ')');
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

    setScreenWait();
  }
  this.initGame = initGame;
})(d3, io, Shake);
