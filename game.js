var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000

app.get('/',function(req, res)
{
    res.sendFile(__dirname + '/index.html');
});

// app.use('/client',express.static(__dirname + '/client'));

http.listen(port, function(){
    console.log('Server is listening on port: '+port);
});

var socket_list = {};
var player_list = {};

var Player = function(id)
{
    var self =
    {
        width: 32,
        height: 32,
        x: 400,
        y: 400,
        x_vel: 0,
        y_vel: 0,
        id:id,
        number: "X",
        pressingUp: false, // Núllstillum alla takka
        pressingDown: false,
        pressingRight: false,
        pressingLeft: false,
        shooting: false, // Núllstillum sskot
        playerSpeed: 2,
    }

    self.updatePosition = function()
    {
        if(self.pressingUp)
        // self.y -= self.playerSpeed;
        self.y_vel -= 1.25;
        if(self.pressingDown)
        // self.y += self.playerSpeed;
        self.y_vel += 1.25;
        if(self.pressingLeft)
        // self.x -= self.PlayerSpeed;
        self.x_vel -= 1.25;
        if(self.pressingRight)
        // self.x += self.playerSpeed;
        self.x_vel += 1.25;
    
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
        
        player.x += player.x_vel; // Hreyfing á X- og Y-ás
        player.y += player.y_vel;
        // player.y_vel += 0.4; // Þyngdarafl
        player.x_vel *= 0.88; // Hröðun
        player.y_vel *= 0.88;
        
        if (player.x < 30) // Hindrum að spilarinn geti komist af skjánum vinstra megin
        {
            player.x = 0 + player.width;
            console.log('vinstri')
        }
     
        else if (player.x > 768) // Hindrum að spilarinn geti komist af skjánum hægra megin
        {
            player.x = 800 - player.width;
            console.log('hægri')
        }

        else if (player.y < 32) // Hindrum að spilarinn geti komist af skjánum efst
        {
            player.y = 0 + player.height;
            console.log('efst')
        }
     
        else if (player.y > 768) // Hindrum að spilarinn geti komist af skjánum neðst
        {
            player.y = 800 - player.height;
            console.log('neðst')
        }


    }
    for(var i in socket_list)
    {
        var socket = socket_list[i];
        socket.emit('newPositions',pack);
    }
}
,1000/30);