
'use strict'

// Server IP
const ip = 'http://localhost:3000' // ex. http://104.131.171.139:3000

// Modules
const readline = require('readline')
const socket = require('socket.io-client')(ip)
const color = require('ansi-color').set

// Nickname
let nick

// Nickname selection
let rl = readline.createInterface(process.stdin, process.stdout)
rl.question('Please, choose your nick: ', name => {
  nick = name
  socket.emit('send', { type: 'notice', message: `${nick} has just entered this chat` })
  rl.prompt(true)
})

const consoleOut = msg => {
  process.stdout.clearLine()
  process.stdout.cursorTo(0)
  console.log(msg)
  rl.prompt(true)
}

rl.on('line', function (line) {
  if (line[0] === '/' && line.length > 1) {
    const cmd = line.match(/[a-z]+\b/)[0]
    const arg = line.substr(cmd.length + 2, line.length)
    chatCommand(cmd, arg)
  } else {
    // Send chat message
    socket.emit('send', { type: 'chat', message: line, nick: nick })
    rl.prompt(true)
  }
})

const chatCommand = (cmd, arg) => {
  switch (cmd) {
    case 'nick':
      const notice = `${nick} has changed his nickname to ${arg}`
      nick = arg
      socket.emit('send', { type: 'notice', message: notice })
      break

    case 'msg':
      const to = arg.match(/[a-z]+\b/)[0]
      const message = arg.substr(to.length, arg.length)
      socket.emit('send', { type: 'tell', message: message, to: to, from: nick })
      break

    case 'me':
      const emote = `${nick} ${arg}`
      socket.emit('send', { type: 'emote', message: emote })
      break

    default:
      consoleOut('This is not a valid command')
  }
}

socket.on('message', data => {
  if (data.type === 'chat' && data.nick !== nick) {
    const leader = color(`<${data.nick}> `, 'green')
    consoleOut(`${leader} ${data.message}`)
  } else if (data.type === 'notice') {
    consoleOut(color(data.message, 'cyan'))
  } else if (data.type === 'tell' && data.to === nick) {
    const leader = color(`[${data.from}->${data.to}]`, 'red')
    consoleOut(`${leader} ${data.message}`)
  } else if (data.type === 'emote') {
    consoleOut(color(data.message, 'cyan'))
  }
})
