const RESOLUTION_WIDTH  = 300
const RESOLUTION_HEIGHT = 200
const GAME_SIZE_ROWS    = 10
const GAME_SIZE_COLS    = 8
const PLAYER_SPEED = 0.03

const map = [
  [null, null, null, null, null,     null,   null,     null, null, null],
  [null, null, null, null, null,     null,   null,     null, null, null],
  [null, null, null, null, null,     null,   null,     null, null, null],
  [null, null, null, null, 'yellow', 'blue', 'purple', null, null, null],
  [null, null, null, null, 'pink',   null,   'green',  null, null, null],
  [null, null, null, null, null,     null,   'red',    null, null, null],
  [null, null, null, null, null,     null,   null,     null, null, null],
  [null, null, null, null, null,     null,   null,     null, null, null],
]

/**
 * Represents a 2D vector
 */
class Vector2 {
  /**
   * Creates a new Vector2 instance
   */
  constructor(public x: number, public y:number) {}

  /**
   * Create a new Vector2 instance with coordinates (0,0)
   */
  static zero(): Vector2 {
    return new Vector2(0, 0)
  }

  /**
   * Performs element wise addition of this Vector2 and a given Vector2
   */
  add(that: Vector2): Vector2 {
    return new Vector2(this.x + that.x, this.y + that.y)
  }

  /**
   * Performs element wise subtraction of this Vector2 and a given Vector2
   */
  sub(that: Vector2): Vector2 {
    return new Vector2(this.x - that.x, this.y - that.y)
  }

  /**
   * Performs multiplication of this Vector2 and a given scalar
   */
  mult(scalar: number): Vector2 {
    return new Vector2(this.x * scalar, this.y * scalar)
  }

  /**
   * Performs divition of this Vector2 and a given scalar
   */
  div(scalar:  number): Vector2 {
    if (scalar === 0) throw new Error('VEC2_DIV_BY_ZERO')
    return new Vector2(this.x / scalar, this.y / scalar)
  }

  /**
   * Calculates the magnitude (length) of this Vector2 instance
   *
   * Think of it like the distance from the origin (0, 0) to the point 
   * represented by this vector. 
   *
   * For example, if you have a vector (3, 4), its magnitude would be the 
   * length of the line from (0, 0) to (3, 4), which is approximately 5. 
   *
   * This can be useful when you need to know how far an object is from a 
   * certain point.
   */
  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }

  /**
   * Normalizes this Vector2
   * 
   * Normalizing a vector means making its length equal to 1, while keeping its
   * direction the same.
   * 
   * Think of it like taking a vector and stretching or shrinking it to make it
   * exactly 1 unit long.
   * 
   * This can be useful when you need to move an object in a certain direction,
   * but you don't care about its speed.
   * 
   * For example, if you have a vector (3, 4) and you normalize it, you would 
   * get a vector (0.6, 0.8), which has the same direction but a length of 1.
   */
  normalize(): Vector2 {
    const magnitude = this.magnitude()
    if (magnitude > 0) {
      this.x /= magnitude
      this.y /= magnitude
    }
    return this
  }

  /**
   * Clamps this Vector2 to the given bounds
   */
  clamp(xMin: number, xMax: number, yMin: number, yMax:number): Vector2 {
    return new Vector2(
      Math.min(Math.max(this.x, xMin), xMax),
      Math.min(Math.max(this.y, yMin), yMax)
    );
  }

  /**
  * Calculates the dot product for this Vector2 and a given Vector2
  *
  * The dot product is a way to measure how similar two vectors are. If the 
  * result is close to 1, the vectors are pointing in the same direction.
  * If the result is close to -1, the vectors are pointing in opposite 
  * directions. If the result is close to 0, the vectors are perpendicular.
  * 
  * For example, if you have two vectors (1, 0) and (0, 1), their dot product 
  * would be 0, because they are perpendicular.
  * 
  * This can be useful when you need to know if two objects are facing each 
  * other, or if they are moving in the same direction.
  */
  dotProduct(that: Vector2): number {
    return this.x * that.x + this.y * that.y
  }

  /**
   * This is similar to the magnitude method, but instead of measuring the 
   * distance from the origin, it measures the distance between two points.
   * 
   * For example, if you have two vectors (1, 2) and (4, 6), the distance 
   * between them would be approximately 5.
   * 
   * This can be useful when you need to know how far apart two objects are.
   */
  distanceTo(that: Vector2): number {
    return Math.sqrt((this.x - that.x) ** 2 + (this.y - that.y) ** 2)
  }
  
}

class Player {
  constructor(
    private readonly level: Level,
    public position: Vector2,
    public direction: Vector2,
    public velocity: Vector2
  ) {}

  update(input: Input) {
    if (input.up)    this.direction.y  -= 1;
    if (input.down)  this.direction.y  += 1;
    if (input.left)  this.direction.x  -= 1;
    if (input.right) this.direction.x  += 1;

    if (this.direction.magnitude() > 0) {
      this.direction.normalize()
    }

    if (input.up)    this.velocity.y  -= PLAYER_SPEED;
    if (input.down)  this.velocity.y  += PLAYER_SPEED;
    if (input.left)  this.velocity.x  -= PLAYER_SPEED;
    if (input.right) this.velocity.x  += PLAYER_SPEED;

    this.position = this.position.add(this.velocity).clamp(0, this.level.width, 0, this.level.height)
    this.velocity = Vector2.zero()
  }
}

class CameraPlane {
  private direction: Vector2 = Vector2.zero()
  public center: Vector2 = Vector2.zero()
  public left: Vector2 = Vector2.zero()
  public right: Vector2 = Vector2.zero()
  
  constructor() {}

  update(player: Player) {
    this.direction = new Vector2(-player.direction.y, player.direction.x).normalize().div(2)
    this.center = new Vector2(
      player.position.x + player.direction.x,
      player.position.y + player.direction.y
    )
    this.left = new Vector2(
      this.center.x - (this.direction.x ),
      this.center.y - (this.direction.y )
    )
    this.right = new Vector2(
      this.center.x + (this.direction.x ),
      this.center.y + (this.direction.y )
    )

  }
}

class Level {
  constructor(
    private map: Array<Array<string | null>>, 
    public readonly width: number, 
    public readonly height: number
  ) {
    if (map.length !== this.height) throw new Error('INVALID_MAP_HEIGHT')
    if (map.every((col) => col.length !== this.width)) throw new Error('INVALID_MAP_WIDTH')
  }

  tile(position: Vector2) {
    const row = this.map[position.y]
    if (row === undefined) throw new Error('MAP_ROW_OUT_OF_BOUND')
    const col = row[position.x]
    if (col === undefined) throw new Error('MAP_COL_OUT_OF_BOUND')
    return col
  }
}

type Input = {
  up:    boolean
  down:  boolean
  left:  boolean
  right: boolean
}

function renderGrid(ctx: CanvasRenderingContext2D, gameSize: Vector2): void {
  for(let y = 0; y <= gameSize.y; y++) {
    for(let x = 0; x <= gameSize.x; x++) {
      ctx.beginPath()
      ctx.strokeStyle = "green"
      ctx.lineWidth = 0.01
      ctx.moveTo(x,y)           // TOP,LEFT
      ctx.lineTo(x + 1, y )     // TOP,RIGHT
      ctx.lineTo(x + 1, y + 1 ) // BOTTOM,RIGHT
      ctx.lineTo(x, y + 1)      // BOTTOM,LEFT
      ctx.lineTo(x, y)          // TOP,LEFT
      ctx.stroke()
    }
  }
}

function renderLevel(ctx: CanvasRenderingContext2D, gameSize: Vector2, level: Level) {
  for(let y = 0; y < gameSize.y; y++) {
    for(let x = 0; x < gameSize.x; x++) {
      const tile = level.tile(new Vector2(x,y))
      if (!tile) continue;
      ctx.beginPath()
      ctx.fillStyle = tile
      ctx.fillRect(x,y, 1, 1)
    }
  }
}

function setupCanvas(canvasSize: Vector2, gameSize: Vector2): CanvasRenderingContext2D {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement | null 
  if (!canvas) throw new Error('MAIN_NO_CANVAS')
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error('MAIN_NO_CONTEXT')

  canvas.setAttribute('width',(canvasSize.x).toString())
  canvas.setAttribute('height',(canvasSize.y).toString())

  ctx.scale(canvasSize.x / gameSize.x, canvasSize.y / gameSize.y)
  return ctx
}


/**
 * Updates the Player according to the given input
 */
function updatePlayer(gameSize: Vector2, player: Player, input: Input) {
  if (input.up)    player.direction.y  -= 1;
  if (input.down)  player.direction.y  += 1;
  if (input.left)  player.direction.x  -= 1;
  if (input.right) player.direction.x  += 1;
  
  if (player.direction.magnitude() === 0) return; // no direction

  player.position = player.direction
    .normalize()
    .mult(PLAYER_SPEED)
    .add(player.position)
    .clamp(0, gameSize.x, 0, gameSize.y)
}

function renderPlayer(ctx: CanvasRenderingContext2D, player: Player): void {
  ctx.beginPath()
  ctx.fillStyle = "red"
  ctx.arc(player.position.x, player.position.y, 0.1, 0, 360)
  ctx.fill()

  ctx.beginPath()
  ctx.strokeStyle = "red"
  ctx.lineWidth = 0.05
  ctx.moveTo(player.position.x, player.position.y)
  ctx.lineTo(
    player.position.x + (player.direction.x * 0.25), 
    player.position.y + (player.direction.y * 0.25) 
  )
  ctx.stroke()
}

function renderCameraPlane(ctx: CanvasRenderingContext2D, cameraPlane: CameraPlane) {
  ctx.beginPath()
  ctx.strokeStyle = "pink"
  ctx.moveTo(cameraPlane.left.x, cameraPlane.left.y)
  ctx.lineTo(cameraPlane.right.x, cameraPlane.right.y)
  ctx.stroke()
}

function renderRay(ctx: CanvasRenderingContext2D, level: Level, player: Player) {


}


function handleInput(e: KeyboardEvent, input: Input): Input {
  if (e.type === "keydown") {
    switch(e.code) {
      case 'KeyW': input.up    = true; break;
      case 'KeyS': input.down  = true; break;
      case 'KeyA': input.left  = true; break;
      case 'KeyD': input.right = true; break;
    }
  }
  if (e.type ==="keyup") {
    switch(e.code) {
      case 'KeyW': input.up    = false; break;
      case 'KeyS': input.down  = false; break;
      case 'KeyA': input.left  = false; break;
      case 'KeyD': input.right = false; break;
    }
  }

  return input
}

function clearCanvas(ctx: CanvasRenderingContext2D, gameSize: Vector2):void {
  ctx.clearRect(0, 0, gameSize.x, gameSize.y)
}

function gameLoop(ctx: CanvasRenderingContext2D, gameSize: Vector2, input: Input, level: Level, player: Player, cameraPlane: CameraPlane): void {
  let prevTimestamp = Date.now()

  function gameInner() {
    const now = Date.now()
    const deltaTime = now - prevTimestamp
    prevTimestamp = now

    player.update(input)
    cameraPlane.update(player)

    // render
    clearCanvas(ctx, gameSize)
    renderGrid(ctx, gameSize)
    renderLevel(ctx, gameSize, level)
    renderPlayer(ctx, player)
    renderCameraPlane(ctx, cameraPlane)
    renderRay(ctx, level, player)

    requestAnimationFrame(gameInner)
  }

  requestAnimationFrame(gameInner)
}


function main() {
  const canvasSize = new Vector2(RESOLUTION_WIDTH, RESOLUTION_HEIGHT)
  const gameSize =  new Vector2(GAME_SIZE_ROWS, GAME_SIZE_COLS)
  const level = new Level(map, GAME_SIZE_ROWS, GAME_SIZE_COLS)
  const ctx = setupCanvas(canvasSize, gameSize)

  const player = new Player(level, new Vector2(2.5, 6.5), new Vector2(0, -1), Vector2.zero())
  const cameraPlane = new CameraPlane(90)
  const input: Input = { left: false, right: false, up: false, down: false }

  window.addEventListener('keydown', (e) => handleInput(e, input))
  window.addEventListener('keyup',   (e) => handleInput(e, input))

  gameLoop(ctx, gameSize, input, level, player, cameraPlane)
}

main()
