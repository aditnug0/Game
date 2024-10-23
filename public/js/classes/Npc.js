
// object npc
class Npc {
    constructor({ x, y, radius, color, }) {
      this.x = x
      this.y = y
      this.radius = radius
      this.color = color
    }
  // method untuk menggambar di frontend
    draw() {
      c.beginPath()
      c.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
      c.fillStyle = this.color
      c.fill()
      c.restore()
    }
  }
  