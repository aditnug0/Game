# 🎉 GAME WEB MULTIPLAYER

A website about a multiplayer game using Node.js and Socket.io where players can move, shoot, collect coins, and interact with a Non-Playable-Character (NPC)

## ✨ Features

- **Multiplayer with Socket.io** –  Players can join in a room with multiple players at real time.
- **Real-Time Leaderboard** –  Leaderboard that is constantly updated in real time.
- **Collision Detection for Player and NPC** – Player or NPC can collide with walls or other objects in the game.
- **Coin Collection Mechanic** – Players can collect coins that show at the arena.
- **NPC Movement** – NPC moves with the same speed and have the logic to avoid wall with bouncing on it.
- **Real-time Player Movement** – Players can move in game using the input from the keyboard, and their moves is synchronized in real time using Socket.io.
- **Bounce Back Mechanism for Players** – Player will stop when collide with the walls, instead of phasing through.
- **Projectile System (on progress)** – Player can shoot projectiles.
  
## ⚙️ How To Play

1. **Enter the Game Room**: Start by entering your username on the homepage.
2. **Control Your Character**:
3. **Movement**: Use the arrow keys or W, A, S, D keys to move your character in the game area.
4. **Shooting**: click to shoot projectiles (in testing mode).
5. **Collect Coins**: Move your character towards the coins to automatically collect them.
6. **Check Leaderboard**: Watch your progress in the real-time leaderboard on the game screen.

## 🔧 Technologies Used

- **HTML5** – For a clean and responsive user interface.
- **CSS** – Custom styles for a sleek design.
- **JavaScript** – Powers the core functionality.
- **Socket.io** – A library for bidirectional communication between web clients and servers in real time.
- **Express** – A library for build web applications and APIs quickly and easily.

## 🚀 Quick Start

1. **Preparation**: Make sure you have Node.js (v14 or higher) and npm installed.
2. **Clone this repository**:

   ```bash
   git clone https://github.com/aditnug0/Game.git
   ```

3. **Open the project**: Navigate to the project folder.
4. **Install dependencies**: Open terminal and write command `npm i ` or `npm install`
   ```bash
   npm install
   ```
5. **Running the program**: To start the server, open terminal with command `nodemon` or `npm run start`
  ```bash
  npm run start
  ```
6. **See the program**: Then, open your browser and go to `http://localhost:5000`.

## 📁 Project Structure
```
/ (Root Directory)
│
├── public/
│   └── img/             # Folder for saving images or other assets
│
├── js/                  # Main folder for the file JavaScript
│   ├── classes/         # Folder for file class
│   │   ├── Coin.js
│   │   ├── Npc.js
│   │   ├── Player.js
│   │   ├── Projectile.js
│   │   ├── Wall.js
│   │
│   ├── eventListeners.js # File for controlling eventlistener
│   ├── frontend.js       # Main file for the frontend logic
│   ├── index.html        # Main HTML file  
│
├── .gitignore           # Configurator file for ignoring the file that in version control
├── backend.js           # Backend logic file
├── package-lock.json    # File that lock project dependency version
├── package.json         # Configurator for dependency and npm script 
└── README.md            # Project documentations
```

## 💥 EXAMPLE CODE

*Handle Check Collision Player and Wall*

```
function checkCollisionWithWalls(player) {
  for (const id in backEndWall) {
    const wall = backEndWall[id];
    // Cek apakah pemain menyentuh dinding
    if (
      player.x + player.radius > wall.x && // Ujung kanan pemain melewati ujung kiri dinding
      player.x - player.radius < wall.x + wall.width && // Ujung kiri pemain melewati ujung kanan dinding
      player.y + player.radius > wall.y && // Ujung bawah pemain melewati ujung atas dinding
      player.y - player.radius < wall.y + wall.height // Ujung atas pemain melewati ujung bawah dinding
    ) {
      // Jika pemain menabrak dinding, atur ulang posisi agar berada di luar dinding
      if (player.x + player.radius > wall.x && player.x < wall.x) {
        player.x = wall.x - player.radius; // Pemain berada di kiri dinding
      } else if (player.x - player.radius < wall.x + wall.width && player.x > wall.x + wall.width) {
        player.x = wall.x + wall.width + player.radius; // Pemain berada di kanan dinding
      }
      if (player.y + player.radius > wall.y && player.y < wall.y) {
        player.y = wall.y - player.radius; // Pemain berada di atas dinding
      } else if (player.y - player.radius < wall.y + wall.height && player.y > wall.y + wall.height) {
        player.y = wall.y + wall.height + player.radius; // Pemain berada di bawah dinding
      }
    }
  }
} 
```

*Handle Update Score for Realtime (frontend)*

```
socket.on('updateScore', (score) => {
  document.querySelector('#coinScore').innerText = `Coins: ${score}`
})
```

*Handle movement NPC*

```
function moveNPCs() {
  for (const npcId in backEndNpcs) {
    const npc = backEndNpcs[npcId];

    // Update posisi NPC
    npc.x += npc.speedX * 3;
    npc.y += npc.speedY * 3;

    // Pembatasan agar NPC tetap dalam area kanvas
    if (npc.x < 0 || npc.x > 1400) {
      npc.speedX *= -1; // Balik arah di sumbu X
    }
    if (npc.y < 0 || npc.y > 700) {
      npc.speedY *= -1; // Balik arah di sumbu Y
    }
    checkCollisionWithWalls(npc)
  }
}
```

## ✌️CONTRIBUTING

We welcome contributions! If you would like to contribute, please follow these steps:

1. Fork the repository.
2. Create a new branch (feature/my-feature).
3. Commit your changes.
4. Push to the branch.
5. Create a pull request.
