var io = require('socket.io').listen(7777);

var players = [];

var runningCount = 1;

io.sockets.on('connection', function (socket) {
    
    var id = runningCount++;
    
    socket.emit('identify', id);
    
    for(p in players) {
        socket.emit('add-character', players[p].getData());
    }
    
    var player = new Player(socket, 0, 0);
    players.push(player);
    
    socket.on('bookkeep-position', function (data) {
      player.x = data.x;
      player.y = data.y;
      
      socket.broadcast.emit('bookkeep-position', player.getData());
    });
    
});

var Player = function(id, socket, x, y) {
  this.id = id;
  this.socket = socket;
  this.x = x;
  this.y = y;
  this.getData = function() {
      return {
          "id": this.id,
          "x": this.x,
          "y": this.y
      };
  }
};