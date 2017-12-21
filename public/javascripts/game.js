!((function(d3, io, Shake) {
  var socket = io.connect('/mobile');

  socket.on('connect', function() {
  });

  function initGame() {
    socket.emit('join', {name: 'debugger', color: 'red'});
    var shake = new Shake({
      threshold: 15,
      timeout: 10
    });
    shake.start();
    window.addEventListener('shake', shakeEventDidOccur, false);

    //function to call when shake occurs
    function shakeEventDidOccur () {
      d3.select('body').insert('div', 'div').text(new Date().getTime());
      socket.emit('move', 1);
    }
  };

  initGame();
})(d3, io, Shake));
