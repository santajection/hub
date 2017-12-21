!(function(d3, io, Shake) {
  var socket = io.connect('/mobile');

  socket.on('connect', function() {
  });

  function initGame() {
    d3.select('#input_name').on('change', function() {
      var s = d3.select(this).property('value');
      if (s.length > 8) {
        d3.select(this).property('value', s.substring(0, 8));
      }
    });
    d3.select('#a_join').on('click', function() {
      d3.event.preventDefault();
      var name = d3.select('#input_name').property('value');
      socket.emit('join', {name: name});
      d3.selectAll('.box').style('visibility', 'hidden');
      d3.select('#div_rule').style('visibility', 'visible');
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

  }
  this.initGame = initGame;
})(d3, io, Shake);
