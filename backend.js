const express = require('express')
const app = express()

// socket.io setup
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000 })

const port = 5000

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

const backEndPlayers = {}
const backEndProjectiles = {}
const backEndCoins = {};
const backEndNpcs = {};
const NUM_NPCS = 2
const NPC_SPEED = 3

const SPEED = 5
const RADIUS = 10
const PROJECTILE_RADIUS = 5
let projectileId = 0

// hadle coin in canvas
function generateCoin() {

  if (Object.keys(backEndCoins).length >= 5){
    return
  }

  const coinId = Math.random().toString(36).substring(2, 9);
  backEndCoins[coinId] = {
    x: Math.random() * 1500,
    y: Math.random() * 700,
    radius: 8, // Radius koin
  };

}
// Menggenerate koin setiap 15 detik (interval bisa diatur)
setInterval(generateCoin, 5000);

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function initializeNPCs() {
  for (let i = 0; i < NUM_NPCS; i++) {
    const npcId = `npc_${i}`;
    const angle = Math.random() * Math.PI * 2;
    backEndNpcs[npcId] = {
      x: Math.random() * 1540, // Koordinat X NPC
      y: Math.random() * 720, // Koordinat Y NPC
      radius: 10, // Radius NPC
      speedX: Math.cos(angle) * NPC_SPEED, // Kecepatan gerakan di sumbu X
      speedY: Math.sin(angle) * NPC_SPEED, // Kecepatan gerakan di sumbu Y
    };
  }
}

initializeNPCs()

function moveNPCs() {
  for (const npcId in backEndNpcs) {
    const npc = backEndNpcs[npcId];

    // Update posisi NPC
    npc.x += npc.speedX * 3;
    npc.y += npc.speedY * 3;

    // Pembatasan agar NPC tetap dalam area kanvas
    if (npc.x < 0 || npc.x > 1540) {
      npc.speedX *= -1; // Balik arah di sumbu X
    }
    if (npc.y < 0 || npc.y > 720) {
      npc.speedY *= -1; // Balik arah di sumbu Y
    }
  }
}



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
      x: width * Math.random(),
      y: height * Math.random(),
      color: `hsl(${360 * Math.random()}, 100%, 50%)`,
      sequenceNumber: 0,
      score: 0,
      username, 
      screenWidth: width,
      screenHeight: height
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

    // const screenWidth = window.innerWidth
    // const screenHeight = window.innerHeight

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

    if (playerSides.right > backEndPlayer.screenWidth)
      backEndPlayers[socket.id].x = backEndPlayer.screenWidth - backEndPlayer.radius

    if (playerSides.top < 0) backEndPlayers[socket.id].y = backEndPlayer.radius

    if (playerSides.bottom > backEndPlayer.screenHeight)
      backEndPlayers[socket.id].y = backEndPlayer.screenHeight - backEndPlayer.radius
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

  //logic tabrakan npc
  for (const npcId1 in backEndNpcs) {
    const npc1 = backEndNpcs[npcId1];
  
    for (const npcId2 in backEndNpcs) {
      if (npcId1 !== npcId2) { // Menghindari perbandingan berulang
        const npc2 = backEndNpcs[npcId2];
  
        const DISTANCE = Math.hypot(npc1.x - npc2.x, npc1.y - npc2.y);
        const COMBINED_RADIUS = npc1.radius + npc2.radius;
  
        if (DISTANCE < COMBINED_RADIUS) {
          // Hitung jarak pantulan
          const dx = npc1.x - npc2.x;
          const dy = npc1.y - npc2.y;
  
          // Hitung sudut pantulan
          const angle = Math.atan2(dy, dx);
          const bounceBackDistance = 30; // Atur jarak pantulan untuk NPC
  
          // Pindahkan kedua NPC setelah tabrakan
          npc1.x += Math.cos(angle) * bounceBackDistance;
          npc1.y += Math.sin(angle) * bounceBackDistance;
  
          npc2.x -= Math.cos(angle) * bounceBackDistance;
          npc2.y -= Math.sin(angle) * bounceBackDistance;

          npc1.color = getRandomColor();  
          npc2.color = getRandomColor(); 


  
          // Emit event untuk tabrakan NPC
          io.emit('npcCollision', {
            npc1: npcId1,
            npc2: npcId2,
            npc1color: npc1.color,
            npc2color: npc2.color
          });
        }
      }
    }
  }

 // Logic NPC tabrakan dengan player
for (const playerId in backEndPlayers) {
  const player = backEndPlayers[playerId];

  for (const npcId in backEndNpcs) {
    const npc = backEndNpcs[npcId];

    const DISTANCE = Math.hypot(player.x - npc.x, player.y - npc.y);
    const COMBINED_RADIUS = player.radius + npc.radius;

    if (DISTANCE < COMBINED_RADIUS) {
      // Hitung jarak pantulan
      const dx = player.x - npc.x;
      const dy = player.y - npc.y;

      // Hitung sudut pantulan
      const angle = Math.atan2(dy, dx);
      const bounceBackDistance = 30; 

      // Pindahkan player sedikit menjauh dari npc
      player.x += Math.cos(angle) * bounceBackDistance;
      player.y += Math.sin(angle) * bounceBackDistance;

      player.color = getRandomColor();  
      npc.color = getRandomColor(); 

      // Emit event untuk tabrakan NPC dan Player
      io.emit('NpcAndPlayerCollision', {
        player: playerId,
        npc: npcId,
        playerColor: player.color,
        npcColor: npc.color,
      });
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

  moveNPCs()

  // update ke klien untuk realtime 
  io.emit('updateProjectiles', backEndProjectiles)
  io.emit('updatePlayers', backEndPlayers)
  io.emit('updateCoins', backEndCoins)
  io.emit('updateNpcs', backEndNpcs);

}, 30)

// Port server
server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

console.log('server did load')
