var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('send', function(data){
    io.emit('message', data);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});