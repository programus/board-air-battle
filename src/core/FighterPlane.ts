import { Board, areArrayEqual } from "."

enum FighterDirection {
  Up = '^',
  Right = '>',
  Down = 'v',
  Left = '<',
}

const bodyPositions = [
                    [0, 0],
  [-2, 1], [-1, 1], [0, 1], [1, 1], [2, 1],
                    [0, 2],
           [-1, 3], [0, 3], [1, 3],
]

function getBodyPosFunctions(): ((dir: FighterDirection, pos: [x: number, y: number]) => [x: number, y: number])[] {
  const dirMaping: {[d in FighterDirection]: [x: number, y: number];} = {
    [FighterDirection.Up]: [0, 1],
    [FighterDirection.Down]: [0, -1],
    [FighterDirection.Left]: [1, 0],
    [FighterDirection.Right]: [-1, 0],
  }

  return bodyPositions.map(p => (dir: FighterDirection, pos: [x: number, y: number]) => dirMaping[dir].map((v, i) => (v >= 0 ? p[v] : -p[-v]) + pos[i]) as [number, number])
}

const bodyPosFunctions = getBodyPosFunctions()

class FighterPlane {
  public static blockCount: number = bodyPosFunctions.length

  private _pos: [x: number, y: number] = [0, 0]
  private _dir: FighterDirection = FighterDirection.Up
  private _blocksPos: [x: number, y: number][] = []
  private _preparing: boolean = true
  private _moving: boolean = false
  private _rotateMap = Object.values(FighterDirection).reduce((prev: {[key: string]: FighterDirection}, curr, i, a) => {
    let index = i + 1
    if (index >= a.length) {
      index = 0
    }
    prev[curr] = a[index]
    return prev
  }, {})

  constructor(pos?: [x: number, y: number], dir?: FighterDirection) {
    if (pos) {
      this._pos = pos
    }
    if (dir) {
      this._dir = dir
    }
    this.refreshPos()
  }

  private refreshPos() {
    this._blocksPos = bodyPosFunctions.map(fn => fn(this._dir, this._pos))
  }

  public get blocksPos(): [x: number, y: number][] {
    return this._blocksPos
  }

  public get pos(): [x: number, y: number] {
    return this._pos
  }

  public get preparing(): boolean {
    return this._preparing
  }

  public set preparing(v : boolean) {
    this._preparing = v
  }

  public get moving(): boolean {
    return this._moving
  }

  public set moving(v: boolean) {
    this._moving = v
  }

  public set(pos: [x: number, y: number], dir: FighterDirection) {
    this._pos = pos
    this._dir = dir
    this.refreshPos()
  }

  public set pos(value: [x: number, y: number]) {
    this._pos = value
    this.refreshPos()
  }

  public get dir(): FighterDirection {
    return this._dir
  }

  public set dir(value: FighterDirection) {
    this._dir = value
    this.refreshPos()
  }

  public getBodyIndex(p: [x: number, y: number]): number {
    return this._blocksPos.findIndex(b => areArrayEqual(b, p))
  }

  public isReady(): boolean {
    return this._blocksPos.every(p => p.every(v => v >= 0) && p[0] < Board.width && p[1] < Board.height)
  }

  public rotate(base?: [number, number]): FighterPlane {
    const index = Math.max(this._blocksPos.findIndex(v => base && areArrayEqual(v, base)), 0)
    const dp = bodyPosFunctions[index](this._dir, [0, 0])
    const newPos = this._pos.map((v, i) => v + (i > 0 ? -dp[0] : dp[0]) + dp[1]) as typeof this._pos
    this._pos = newPos
    this._dir = this._rotateMap[this._dir]
    this.refreshPos()
    return this
  }

  public toString(): string {
    return `FP:${this._pos[0]}${this._pos[1]}${this._dir}`
  }

  public static fromString(str: string): FighterPlane|null {
    const regex = /FP:(\d)(\d)([\^v<>])/
    const m = regex.exec(str)
    let ret: FighterPlane|null = null
    if (m) {
      const pos = [parseInt(m[1]), parseInt(m[2])] as [x: number, y: number]
      const dir = m[3] as FighterDirection
      ret = new FighterPlane(pos, dir)
    }
    return ret
  }
}

export {
  FighterDirection,
  FighterPlane,
}