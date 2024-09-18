
const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const socket = io()

const scoreEl = document.querySelector('#scoreEl')

const devicePixelRatio = window.devicePixelRatio || 1

// const aspecRatio = window.innerWidth / window.innerHeight

canvas.width = window.innerWidth * devicePixelRatio
canvas.height = window.innerHeight * devicePixelRatio


c.scale(devicePixelRatio, devicePixelRatio)

const x = canvas.width / 2
const y = canvas.height / 2

const frontEndPlayers = {}
const frontEndProjectiles = {}
const frontEndCoins = {}
const frontEndNpcs ={}

socket.on('updateNpcs', (backEndNpcs) => {
  for(const id in backEndNpcs){
    const backEndNpc = backEndNpcs[id]
    if (!frontEndNpcs[id]) {
      frontEndNpcs[id] = new Npc({
        x: backEndNpc.x,
        y: backEndNpc.y,
        radius: backEndNpc.radius,
        color: 'white', // warna koin
      })
    } else{
      frontEndNpcs[id].target = {
        x: backEndNpc.x,
        y: backEndNpc.y
      }
    }
  }
})


socket.on('updateCoins', (backEndCoins) => {
  for (const id in backEndCoins) {
    const backEndCoin = backEndCoins[id]

    if (!frontEndCoins[id]) {
      frontEndCoins[id] = new Coin({
        x: backEndCoin.x,
        y: backEndCoin.y,
        radius: backEndCoin.radius,
        color: 'yellow' // warna koin
      })
    }
  }

  for (const frontEndCoinId in frontEndCoins) {
    if (!backEndCoins[frontEndCoinId]) {
      delete frontEndCoins[frontEndCoinId]
    }
  }
})



socket.on('updateProjectiles', (backEndProjectiles) => {
  for (const id in backEndProjectiles) {
    const backEndProjectile = backEndProjectiles[id]

    if (!frontEndProjectiles[id]) {
      frontEndProjectiles[id] = new Projectile({
        x: backEndProjectile.x,
        y: backEndProjectile.y,
        radius: 5,
        color: frontEndPlayers[backEndProjectile.playerId]?.color,
        velocity: backEndProjectile.velocity
      })
    } else {
      frontEndProjectiles[id].x += backEndProjectiles[id].velocity.x
      frontEndProjectiles[id].y += backEndProjectiles[id].velocity.y
    }
  }

  for (const frontEndProjectileId in frontEndProjectiles) {
    if (!backEndProjectiles[frontEndProjectileId]) {
      delete frontEndProjectiles[frontEndProjectileId]
    }
  }
})


// bug di sini coin sama kill masih nyampur
socket.on('updatePlayers', (backEndPlayers) => {
  for (const id in backEndPlayers) {
    const backEndPlayer = backEndPlayers[id]

    if (!frontEndPlayers[id]) {
      frontEndPlayers[id] = new Player({
        x: backEndPlayer.x,
        y: backEndPlayer.y,
        radius: 10,
        color: backEndPlayer.color,
        username: backEndPlayer.username

      })

      document.querySelector(
        '#playerLabels'
      ).innerHTML += `<div data-id="${id}" data-score="${backEndPlayer.score}">${backEndPlayer.username}: ${backEndPlayer.score}</div>`
    } else {

      frontEndPlayers[id].x = backEndPlayer.x
      frontEndPlayers[id].y = backEndPlayer.y

      document.querySelector(
        `div[data-id="${id}"]`
      ).innerHTML = `${backEndPlayer.username}: ${backEndPlayer.score}`

      document
        .querySelector(`div[data-id="${id}"]`)
        .setAttribute('data-score', backEndPlayer.score)

      // sorts the players divs
      const parentDiv = document.querySelector('#playerLabels')
      const childDivs = Array.from(parentDiv.querySelectorAll('div'))

      childDivs.sort((a, b) => {
        const scoreA = Number(a.getAttribute('data-score'))
        const scoreB = Number(b.getAttribute('data-score'))

        return scoreB - scoreA
      })

      // removes old elements
      childDivs.forEach((div) => {
        parentDiv.removeChild(div)
      })

      // adds sorted elements
      childDivs.forEach((div) => {
        parentDiv.appendChild(div)
      })

      frontEndPlayers[id].target = {
        x: backEndPlayer.x,
        y: backEndPlayer.y
      }

      if (id === socket.id) {
        const lastBackendInputIndex = playerInputs.findIndex((input) => {
          return backEndPlayer.sequenceNumber === input.sequenceNumber
        })

        if (lastBackendInputIndex > -1)
          playerInputs.splice(0, lastBackendInputIndex + 1)

        playerInputs.forEach((input) => {
          frontEndPlayers[id].target.x += input.dx
          frontEndPlayers[id].target.y += input.dy
        })
      }
    }
  }

  // this is where we delete frontend players
  for (const id in frontEndPlayers) {
    if (!backEndPlayers[id]) {
      const divToDelete = document.querySelector(`div[data-id="${id}"]`)
      divToDelete.parentNode.removeChild(divToDelete)

      if (id === socket.id) {
        document.querySelector('#usernameForm').style.display = 'block'
      }

      delete frontEndPlayers[id]
    }
  }

  // hadle player pick koin and change color
  for (const playerId in backEndPlayers) {
    const player = backEndPlayers[playerId];
    // Update the player color in your frontend canvas
    updatePlayerColor(playerId, player.color);
  }

})

socket.on('collision', ({ player1, player2 }) => {
  console.log(`Collision detected between ${player1} and ${player2}`);
});

socket.on('npcCollision', ({ npc1, npc2, npc1color, npc2Color }) => {
  
  // Ubah warna NPC yang bertabrakan
  if (frontEndNpcs[npc1]) {
    frontEndNpcs[npc1].color = npc1color;
  }

  if (frontEndNpcs[npc2]){
    frontEndNpcs[npc2].color =npc2Color
  }
});

socket.on('NpcAndPlayerCollision', ({ player, npc, playerColor, npcColor }) => {
  // Ubah warna player yang bertabrakan
  if (frontEndPlayers[player]) {
    frontEndPlayers[player].color = playerColor;
  }

  // Ubah warna NPC yang bertabrakan
  if (frontEndNpcs[npc]) {
    frontEndNpcs[npc].color = npcColor;
  }
});

socket.on('eliminationNotification', (data) => {
  alert(data.message); // Menampilkan notifikasi eliminasi
});

function updatePlayerColor(playerId, color) {
  // Pastikan frontEndPlayers sudah ada di frontend dan memiliki struktur yang benar
  if (frontEndPlayers[playerId]) {
    frontEndPlayers[playerId].color = color; // Update color in the frontEndPlayers object

    // Contoh: jika ada metode draw() pada objek Player
    frontEndPlayers[playerId].draw(); // Redraw player with new color
  }
}

function lerp(start, end, t) {
  return start + (end - start) * t
}

let animationId
function animate() {
  animationId = requestAnimationFrame(animate)
  // c.fillStyle = 'rgba(0, 0, 0, 0.1)'
  c.clearRect(0, 0, canvas.width, canvas.height)



  for (const id in frontEndPlayers) {
    const frontEndPlayer = frontEndPlayers[id]

    // linear interpolation
    if (frontEndPlayer.target) {
      frontEndPlayers[id].x +=
        (frontEndPlayers[id].target.x - frontEndPlayers[id].x) * 0.5
      frontEndPlayers[id].y +=
        (frontEndPlayers[id].target.y - frontEndPlayers[id].y) * 0.5
    }

    frontEndPlayer.draw()
  }

  for (const id in frontEndProjectiles) {
    const frontEndProjectile = frontEndProjectiles[id]
    frontEndProjectile.draw()
  }

  // for (let i = frontEndProjectiles.length - 1; i >= 0; i--) {
  //   const frontEndProjectile = frontEndProjectiles[i]
  //   frontEndProjectile.update()
  // }

  for (const id in frontEndCoins) {
    const frontEndCoin = frontEndCoins[id]
    frontEndCoin.draw()
  }

  for (const id in frontEndNpcs){
    const frontEndNpc = frontEndNpcs[id]

    if (frontEndNpc.target) {
    //   frontEndNpc.x = lerp(frontEndNpc.x, frontEndNpc.target.x, 0.1)
    //   frontEndNpc.y = lerp(frontEndNpc.y, frontEndNpc.target.y, 0.1)

    frontEndNpcs[id].x +=
        (frontEndNpcs[id].target.x - frontEndNpcs[id].x) * 0.1
      frontEndNpcs[id].y +=
        (frontEndNpcs[id].target.y - frontEndNpcs[id].y) * 0.1

    }

    frontEndNpc.draw()
  }

}

animate()

const keys = {
  w: {
    pressed: false
  },
  a: {
    pressed: false
  },
  s: {
    pressed: false
  },
  d: {
    pressed: false
  }
}

const SPEED = 5
const playerInputs = []
let sequenceNumber = 0
setInterval(() => {
  if (keys.w.pressed) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: 0, dy: -SPEED })
    // frontEndPlayers[socket.id].y -= SPEED
    socket.emit('keydown', { keycode: 'KeyW', sequenceNumber })
  }

  if (keys.a.pressed) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: -SPEED, dy: 0 })
    // frontEndPlayers[socket.id].x -= SPEED
    socket.emit('keydown', { keycode: 'KeyA', sequenceNumber })
  }

  if (keys.s.pressed) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: 0, dy: SPEED })
    // frontEndPlayers[socket.id].y += SPEED
    socket.emit('keydown', { keycode: 'KeyS', sequenceNumber })
  }

  if (keys.d.pressed) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: SPEED, dy: 0 })
    // frontEndPlayers[socket.id].x += SPEED
    socket.emit('keydown', { keycode: 'KeyD', sequenceNumber })
  }
}, 15)

window.addEventListener('keydown', (event) => {
  if (!frontEndPlayers[socket.id]) return

  switch (event.code) {
    case 'KeyW':
      keys.w.pressed = true
      break

    case 'KeyA':
      keys.a.pressed = true
      break

    case 'KeyS':
      keys.s.pressed = true
      break

    case 'KeyD':
      keys.d.pressed = true
      break
  }
})

window.addEventListener('keyup', (event) => {
  if (!frontEndPlayers[socket.id]) return

  switch (event.code) {
    case 'KeyW':
      keys.w.pressed = false
      break

    case 'KeyA':
      keys.a.pressed = false
      break

    case 'KeyS':
      keys.s.pressed = false
      break

    case 'KeyD':
      keys.d.pressed = false
      break
  }
})

socket.on('updateScore', (score) => {
  document.querySelector('#coinScore').innerText = `Coins: ${score}`
})

document.querySelector('#usernameForm').addEventListener('submit', (event) => {
  event.preventDefault()
   const user = document.querySelector('#usernameInput').value
 document.querySelector('#usernameForm').style.display = 'none'
   //hadle username empty
  if (user == null || user == ""  ){
    alert("Username is empty")
    window.location.href = '/'
  }
  else{
    socket.emit('initGame', {
      width: canvas.width / devicePixelRatio,
      height: canvas.height / devicePixelRatio,
      devicePixelRatio,
      username: user
    })
  }
  })

  
