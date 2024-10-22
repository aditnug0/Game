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

1. **Masuk ke Halaman Utama**: Memasukkan nama pengguna yang akan muncul di leaderboard game.
2. **Masuk ke Ruangan Permainan**: Pemain dapat menggerakkan karakter mereka menggunakan tombol keyboard (WASD).

## 🔧 Technologies Used

- **HTML5** – For a clean and responsive user interface.
- **CSS** – Custom styles for a sleek design.
- **JavaScript** – Powers the core functionality.
- **Socket.io** – A library for bidirectional communication between web clients and servers in real time.
- **Express** – A library for build web applications and APIs quickly and easily.

## 🚀 Quick Start

1. **Clone this repository**:

   ```bash
   git clone https://github.com/aditnug0/Game.git
   ```

2. **Open the project**: Navigate to the project folder, open terminal and run command `nodemon or npm run start` and open `localhost:5000` in your web browser.

