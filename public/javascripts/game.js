!(function(d3, io, Shake) {
  var socket = io.connect('/mobile');

  socket.on('connect', function() {
  });

  function initGame() {
    d3.select('#button_join').on('click', function() {
      d3.event.preventDefault();
      var name = d3.select('#input_name').property('value');
      socket.emit('join', {name: name});
    });
    var shake = new Shake({
      threshold: 15,
      timeout: 10
    });
    shake.start();
    window.addEventListener('shake', shakeEventDidOccur, false);

    function shakeEventDidOccur () {
      d3.select('body').insert('div', 'div').text(new Date().getTime());
      socket.emit('move', 1);
    }
  }
  this.initGame = initGame;
})(d3, io, Shake);
