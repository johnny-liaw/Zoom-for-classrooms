const express = require('express')

var io = require('socket.io')
({
  path: '/webrtc'
})

const app = express()
const port = 8080

// app.get('/', (req, res) => res.send('Hello World!!!!!'))

//https://expressjs.com/en/guide/writing-middleware.html
app.use(express.static(__dirname + '/build'))
app.get('/', (req, res, next) => {
    res.sendFile(__dirname + '/build/index.html')
})

const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`))

io.listen(server)

// https://www.tutorialspoint.com/socket.io/socket.io_namespaces.htm
const peers = io.of('/webrtcPeer')

// keep a reference of all socket connections
let connectedPeers = new Map()

peers.on('connection', socket => {

  console.log(socket.id)
  socket.emit('connection-success', { success: socket.id })

  connectedPeers.set(socket.id, socket)

  socket.on('disconnect', () => {
    console.log('disconnected')
    connectedPeers.delete(socket.id)
  })

  socket.on('join', (data) => {
    console.log(`${socket.id} joined room ${data.payload}`)
    let clients = io.nsps['/webrtcPeer'].adapter.rooms[data.payload];
    let numClients = typeof clients !== "undefined" ? clients.length : 0;
    if(numClients == 0) {
      socket.join(data.payload) 
    } else if(numClients == 1) {
      socket.join(data.payload)
      peers.to(data.payload).emit('roomReady', { roomReady: true })  
      socket.broadcast.to(data.payload).emit('brokerConnection')
      console.log('room full')
    } else {
      socket.emit('full', data)
    }
  })

  socket.on('offerOrAnswer', (data) => {
    // // send to the other peer(s) if any
    // for (const [socketID, socket] of connectedPeers.entries()) {
    //   // don't send to self
    //   if (socketID !== data.socketID) {
    //     console.log(socketID, data.payload.type)
    //     socket.emit('offerOrAnswer', data.payload)
    //   }
    // }
    console.log('offerOrAnswer');
    console.log(data.payload.sdp);
    console.log(data.payload.roomId);
    socket.broadcast.to(data.payload.roomId).emit('offerOrAnswer', data.payload.sdp)
  })

  socket.on('candidate', (data) => {
    // // send candidate to the other peer(s) if any
    // for (const [socketID, socket] of connectedPeers.entries()) {
    //   // don't send to self
    //   if (socketID !== data.socketID) {
    //     console.log(socketID, data.payload)
    //     socket.emit('candidate', data.payload)
    //   }
    // }
    socket.broadcast.to(data.payload.roomId).emit('offerOrAnswer', data.payload.sdp)
  })

})