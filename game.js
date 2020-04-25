var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/',function(req, res)
{
    res.sendFile(__dirname + '/client/index.html');
});

app.use('/client',express.static(__dirname + '/client'));

http.listen(2000);
console.log("Server started.");

var socket_list = {};
var player_list = {};

var Player = function(id, player)
{
    var self =
    {
        x: Math.floor(500 * Math.random()),
        y: Math.floor(500 * Math.random()),
        id:id,
        number: "" + Math.floor(2),
        pressingUp: false, // Núllstillum alla takka
        pressingDown: false,
        pressingRight: false,
        pressingLeft: false,
        playerSpeed:10,
    }

    self.updatePosition = function()
    {
        if(self.pressingRight)
            self.x += self.playerSpeed;
        if(self.pressingLeft)
            self.x -= self.playerSpeed;
        if(self.pressingUp)
            self.y -= self.playerSpeed;
        if(self.pressingDown)
            self.y += self.playerSpeed;
    }
    return self;
}

var io = require('socket.io')(http);
io.sockets.on('connection', function(socket){
    socket.id = Math.random();
    socket_list[socket.id] = socket;

    var player = Player(socket.id);
    player_list[socket.id] = player;
	
    socket.on('disconnect',function()
    {
        delete socket_list[socket.id];
        delete player_list[socket.id];
    });
	
    socket.on('keyPress',function(key)
    {
        if(key.inputId === 'Up')
            player.pressingUp = key.state;
        else if(key.inputId === 'Down')
            player.pressingDown = key.state;
        else if(key.inputId === 'Left')
            player.pressingLeft = key.state;
        else if(key.inputId === 'Right')
            player.pressingRight = key.state;
    });
});

setInterval(function()
{
    var pack = [];
    for(var i in player_list){
        var player = player_list[i];
        player.updatePosition();
        pack.push({
            x:player.x,
            y:player.y,
            number:player.number
        });		
    }
    for(var i in socket_list)
    {
        var socket = socket_list[i];
        socket.emit('newPositions',pack);
    }
}
,1000/30);