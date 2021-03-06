
var fs = require('fs');
var connect = require('connect');
var express = require('express');
var http = require('http');

var app = express();
var server = http.createServer(app);

app.use('/js', express.static(__dirname + '/public_html/js'));
app.use('/images', express.static(__dirname + '/public_html/images'));
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/public_html/index.html');
});

var port = process.env.PORT || 7777;
server.listen(port);

var players = [];
var maps = [];
var firstMap = "grass";

var runningCount = 1;

//LOADING!!!
console.log("Loading...");

//MAPS
loadMap("grass", "tilesets/grass.json");

var io = require('socket.io').listen(server);
io.set('log level', 1);

console.log("Done loading. Ready to start taking players!");

function loadMap(name, filename) {
    fs.readFile(filename, function(err, data) {
        var tilexData = JSON.parse(data);
        maps[name] = tilexData;
    });
}

io.sockets.on('connection', function (socket) {
    
    var id = runningCount++;
    
    socket.emit('identify', id);
    
    for(p in players) {
        socket.emit('add-player', {
          "id": players[p].id, 
          "position": players[p].position,
          "velocity": players[p].velocity,
          "nickname": players[p].nickname
        });
    }
    
    var player = new Player(id, socket, 0, 0, 0, 0);
    players[id] = player;
    
    socket.broadcast.emit('add-player', {
        "id": id, 
        "position": {"x": 0, "y": 0},
        "velocity": {"x": 0, "y": 0},
        "nickname": player.nickname
      });
    
    socket.emit('update-nickname', {
        "id": id,
        "nickname": player.nickname
    });
    
    socket.emit('update-map', {
        "name": firstMap,
        "tileset": maps[firstMap]
    });
    
    socket.on('update-position', function (data) {
      player.position = data.position;
      
      socket.broadcast.emit('update-position', {
          "id": id, 
          "position": player.position
      });
    });
    
    socket.on('update-velocity', function (data) {
      player.velocity = data.velocity;
      
      socket.broadcast.emit('update-velocity', {
          "id": id, 
          "velocity": player.velocity
      });
    });
    
    socket.on('disconnect', function () {
      delete players[id];
      socket.broadcast.emit('remove-player', {
          "id": id
      });
    });
});

function printPlayerIndexes() {
    var tmp = "";
    for(i in players) {
        tmp += ","+i;
    }
    console.log(tmp);
}

var Player = function(id, socket, x, y, vx, vy) {
  this.id = id;
  this.socket = socket;
  this.position = {"x": x, "y": y};
  this.velocity = {"x": vx, "y": vy};
  this.nickname = "Guest-"+id;
};
