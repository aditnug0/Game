const express = require('express')
const app = express()

// socket.io setup
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const { CLIENT_RENEG_LIMIT } = require('tls')
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000 })

const port = 3000

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

const backEndPlayers = {}
const backEndProjectiles = {}
const backEndCoins = {};

const SPEED = 5
const RADIUS = 10
const PROJECTILE_RADIUS = 5
let projectileId = 0

// hadle coin in canvas
function generateCoin() {

  if (Object.keys(backEndCoins).length >= 2){
    return
  }

  const coinId = Math.random().toString(36).substring(2, 9);
  backEndCoins[coinId] = {
    x: Math.random() * 1024,
    y: Math.random() * 576,
    radius: 8, // Radius koin
  };

}
// Menggenerate koin setiap 15 detik (interval bisa diatur)
setInterval(generateCoin, 10000);




io.on('connection', (socket) => {
  console.log('a user connected')

  io.emit('updatePlayers', backEndPlayers)

  // hadle shoot player
  socket.on('shoot', ({ x, y, angle }) => {
    projectileId++

    const velocity = {
      x: Math.cos(angle) * 5,
      y: Math.sin(angle) * 5
    }

    backEndProjectiles[projectileId] = {
      x,
      y,
      velocity,
      playerId: socket.id
    }

    console.log(backEndProjectiles)
  })

  // hadle mulai game
  socket.on('initGame', ({ username, width, height }) => {
    backEndPlayers[socket.id] = {
      x: 1024 * Math.random(),
      y: 576 * Math.random(),
      color: `hsl(${360 * Math.random()}, 100%, 50%)`,
      sequenceNumber: 0,
      score: 0,
      username
    }

    // where we init our canvas
    backEndPlayers[socket.id].canvas = {
      width,
      height
    }

    backEndPlayers[socket.id].radius = RADIUS
  })

  // hadle player disconnect
  socket.on('disconnect', (reason) => {
    console.log(reason)
    delete backEndPlayers[socket.id]
    io.emit('updatePlayers', backEndPlayers)
  })

  // hadle key AWSD 
  socket.on('keydown', ({ keycode, sequenceNumber }) => {
    const backEndPlayer = backEndPlayers[socket.id]

    if (!backEndPlayers[socket.id]) return

    backEndPlayers[socket.id].sequenceNumber = sequenceNumber
    switch (keycode) {
      case 'KeyW':
        backEndPlayers[socket.id].y -= SPEED
        break

      case 'KeyA':
        backEndPlayers[socket.id].x -= SPEED
        break

      case 'KeyS':
        backEndPlayers[socket.id].y += SPEED
        break

      case 'KeyD':
        backEndPlayers[socket.id].x += SPEED
        break
    }

    const playerSides = {
      left: backEndPlayer.x - backEndPlayer.radius,
      right: backEndPlayer.x + backEndPlayer.radius,
      top: backEndPlayer.y - backEndPlayer.radius,
      bottom: backEndPlayer.y + backEndPlayer.radius
    }

    if (playerSides.left < 0) backEndPlayers[socket.id].x = backEndPlayer.radius

    if (playerSides.right > 1024)
      backEndPlayers[socket.id].x = 1024 - backEndPlayer.radius

    if (playerSides.top < 0) backEndPlayers[socket.id].y = backEndPlayer.radius

    if (playerSides.bottom > 576)
      backEndPlayers[socket.id].y = 576 - backEndPlayer.radius
  })
})


// pengaturan logic game

setInterval(() => {
  // update projectile positions
  for (const id in backEndProjectiles) {
    backEndProjectiles[id].x += backEndProjectiles[id].velocity.x
    backEndProjectiles[id].y += backEndProjectiles[id].velocity.y

    const PROJECTILE_RADIUS = 5
    if (
      backEndProjectiles[id].x - PROJECTILE_RADIUS >=
        backEndPlayers[backEndProjectiles[id].playerId]?.canvas?.width ||
      backEndProjectiles[id].x + PROJECTILE_RADIUS <= 0 ||
      backEndProjectiles[id].y - PROJECTILE_RADIUS >=
        backEndPlayers[backEndProjectiles[id].playerId]?.canvas?.height ||
      backEndProjectiles[id].y + PROJECTILE_RADIUS <= 0
    ) {
      delete backEndProjectiles[id]
      continue
    }


// logic kill player
    for (const playerId in backEndPlayers) {
      const backEndPlayer = backEndPlayers[playerId]

      const DISTANCE = Math.hypot(
        backEndProjectiles[id].x - backEndPlayer.x,
        backEndProjectiles[id].y - backEndPlayer.y
      )

      // collision detection
      if (
        DISTANCE < PROJECTILE_RADIUS + backEndPlayer.radius &&
        backEndProjectiles[id].playerId !== playerId
      ) {
        const eliminatedPlayerId = playerId
        if (backEndPlayers[backEndProjectiles[id].playerId])
          backEndPlayers[backEndProjectiles[id].playerId].score++

        // notif eliminasi
        io.to(eliminatedPlayerId).emit('eliminationNotification', { message: `You have been eliminated! by ${backEndPlayers[backEndProjectiles[id].playerId].username}` });

        // Hapus pemain dan proyektil
        console.log(backEndPlayers[backEndProjectiles[id].playerId ])
        delete backEndProjectiles[id]
        delete backEndPlayers[playerId]
        break
      }
    }
  }

  // logic untuk player tabrakan
  for (const playerId1 in backEndPlayers) {
    for (const playerId2 in backEndPlayers) {
      if (playerId1 !== playerId2) {
        const player1 = backEndPlayers[playerId1];
        const player2 = backEndPlayers[playerId2];
  
        const DISTANCE = Math.hypot(player1.x - player2.x, player1.y - player2.y);
        const COMBINED_RADIUS = player1.radius + player2.radius;
  
        if (DISTANCE < COMBINED_RADIUS) {
          // Hitung diagonal x dan y player
          const dx = player1.x - player2.x;
          const dy = player1.y - player2.y;
  
          // Hitung sudut pantulan
          const angle = Math.atan2(dy, dx);
          const bounceBackDistance = 50;
  
          // Pindahkan pemain
          player1.x += Math.cos(angle) * bounceBackDistance;
          player1.y += Math.sin(angle) * bounceBackDistance;
  
          player2.x -= Math.cos(angle) * bounceBackDistance;
          player2.y -= Math.sin(angle) * bounceBackDistance;

          io.emit('collision', {
            player1: playerId1,
            player2: playerId2
          });

        }
      }
    }
  }
  





// logic untuk koin dan ganti warna
let collectId  // untuk menampung id player pick coin 
  for (const coinId in backEndCoins) {
    for (const playerId in backEndPlayers) {
      const backEndPlayer = backEndPlayers[playerId];

      const DISTANCE = Math.hypot(
        backEndCoins[coinId].x - backEndPlayer.x,
        backEndCoins[coinId].y - backEndPlayer.y
      );

      if (DISTANCE < backEndPlayer.radius + backEndCoins[coinId].radius) {
        // Pemain mengambil koin
        backEndPlayer.score += 10; // Tambah skor 10 untuk pengambilan koin
        collectId = playerId
        console.log(collectId)
        delete backEndCoins[coinId]; // Hapus koin
        break;
      }
    }
    if (collectId) break
  }
  if (collectId){
    for (const playerId in backEndPlayers){
      if(playerId !== collectId){
        backEndPlayers[playerId].color =`hsl(${360 * Math.random()}, 100%, 50%)`;
        console.log(`Player ${playerId} new color: ${backEndPlayers[playerId].color}`);
      }
    }
  }

  // update ke klien untuk realtime 
  io.emit('updateProjectiles', backEndProjectiles)
  io.emit('updatePlayers', backEndPlayers)
  io.emit('updateCoins', backEndCoins)

}, 15)

// Port server
server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

console.log('server did load')
