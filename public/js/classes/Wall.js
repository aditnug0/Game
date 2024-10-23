
// objeck wall 
class Wall {
    constructor({ x, y, width, height }) {
      this.x = x
      this.y = y
      this.width = width
      this.height = height
    }
  // method untuk menggambar di frontend
    draw() {
      c.beginPath()
      c.fillStyle = '#FF0000'
      c.fillRect(this.x, this.y, this.width, this.height)
      c.closePath()
    }
  }