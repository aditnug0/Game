# 🎉 GAME WEB MULTIPLAYER

Sebuah website game multiplayer menggunakan Node.js dan Socket.io di mana player bisa bergerak, menembak, mengumpulkan koin, dan berinteraksi dengan Non-Player Characters (NPC)

## ✨ Features

- **Multiplayer dengan Socket.io** –  Player bisa bergabung dalam satu ruangan untuk bermain bersama secara real-time.
- **Leaderboard Real-Time** –  Leaderboard yang terus diperbarui secara real-time.
- **Collision Detection untuk Player dan NPC** – Player atau NPC bisa bertabrakan dengan dinding atau objek lain di dalam game.
- **Coin Collection Mechanic** – Player bisa mengumpulkan koin yang muncul di arena.
- **NPC Movement** – NPC bergerak dengan kecepatan yang seragam dan memiliki logika untuk menghindari dinding dengan cara memantul ketika menyentuhnya.
- **Real-time Player Movement** – Player dapat bergerak dalam game menggunakan input dari keyboard, dan gerakan mereka disinkronkan secara real-time menggunakan Socket.io.
- **Bounce Back Mechanism for Players** – Player akan berhenti ketika menyentuh tembok, alih-alih menembusnya.
- **Projectile System (on progress)** – Player dapat menembakkan proyektil.
  
## ⚙️ How It Works

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
│   └── img/             # Folder untuk menyimpan gambar atau aset statis lainnya
│
├── js/                  # Folder utama untuk file JavaScript
│   ├── classes/         # Folder untuk file class
│   │   ├── Coin.js
│   │   ├── Npc.js
│   │   ├── Player.js
│   │   ├── Projectile.js
│   │   ├── Wall.js
│   │
│   ├── eventListeners.js # File untuk mengatur eventlistener
│   ├── frontend.js       # File utama untuk logika frontend
│   ├── index.html        # File HTML utama
│
├── .gitignore           # File konfigurasi untuk mengabaikan file dalam version control
├── backend.js           # File untuk logika backend
├── package-lock.json    # File yang mengunci versi dependensi proyek
├── package.json         # File konfigurasi untuk dependensi dan script npm
└── README.md            # Dokumentasi proyek
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
