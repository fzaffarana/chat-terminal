
var readline = require('readline'),
socket = require('socket.io-client')('http://104.131.171.139:3000');

util = require('util'),
color = require("ansi-color").set;
 
 
var nick;
var rl = readline.createInterface(process.stdin, process.stdout);

rl.question("Por favor ingrese un nick: ", function(name) {
    nick = name;
    var msg = nick + " ha ingresado al chat";
    socket.emit('send', { type: 'notice', message: msg });
    rl.prompt(true);
});

function console_out(msg) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    console.log(msg);
    rl.prompt(true);
}

rl.on('line', function (line) {
    if (line[0] == "/" && line.length > 1) {
        var cmd = line.match(/[a-z]+\b/)[0];
        var arg = line.substr(cmd.length+2, line.length);
        chat_command(cmd, arg);
 
    } else {
        // send chat message
        socket.emit('send', { type: 'chat', message: line, nick: nick });
        rl.prompt(true);
    }
});

function chat_command(cmd, arg) {
    switch (cmd) {
 
        case 'nick':
            var notice = nick + " cambio su nombre a " + arg;
            nick = arg;
            socket.emit('send', { type: 'notice', message: notice });
            break;
 
        case 'msg':
            var to = arg.match(/[a-z]+\b/)[0];
            var message = arg.substr(to.length, arg.length);
            socket.emit('send', { type: 'tell', message: message, to: to, from: nick });
            break;
 
        case 'me':
            var emote = nick + " " + arg;
            socket.emit('send', { type: 'emote', message: emote });
            break;
 
        default:
            console_out("Ese no es un comando valido x_x");
 
    }
}

socket.on('message', function (data) {
    var leader;
    if (data.type == 'chat' && data.nick != nick) {
        leader = color("<"+data.nick+"> ", "green");
        console_out(leader + data.message);
    }
    else if (data.type == "notice") {
        console_out(color(data.message, 'cyan'));
    }
    else if (data.type == "tell" && data.to == nick) {
        leader = color("["+data.from+"->"+data.to+"]", "red");
        console_out(leader + data.message);
    }
    else if (data.type == "emote") {
        console_out(color(data.message, "cyan"));
    }
});