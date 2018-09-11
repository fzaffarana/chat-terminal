'use strict'

// Modules
const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)

io.on('connection', socket => {
  console.log('User connected')
  socket.on('send', data => {
    io.emit('message', data)
  })
})

http.listen(3000, () => {
  console.log('listening on *:3000')
})
