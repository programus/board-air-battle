import { Board } from "."

export enum FighterDirection {
  Up = '^',
  Down = 'v',
  Left = '<',
  Right = '>',
}

function getBodyPosFunctions(): ((dir: FighterDirection, pos: [x: number, y: number]) => [x: number, y: number])[] {
  const dirMaping: {[d in FighterDirection]: [x: number, y: number];} = {
    [FighterDirection.Up]: [0, 1],
    [FighterDirection.Down]: [0, -1],
    [FighterDirection.Left]: [1, 0],
    [FighterDirection.Right]: [-1, 0],
  }

  return [
                      [0, 0],
    [-2, 1], [-1, 1], [0, 1], [1, 1], [2, 1],
                      [0, 2],
             [-1, 3], [0, 3], [1, 3],
  ].map(p => (dir: FighterDirection, pos: [x: number, y: number]) => dirMaping[dir].map((v, i) => (v >= 0 ? p[v] : -p[-v]) + pos[i]) as [number, number])
}

const bodyPosFunctions = getBodyPosFunctions()

export class FighterPlane {
  public static blockCount: number = bodyPosFunctions.length

  private _pos: [x: number, y: number] = [0, 0]
  private _dir: FighterDirection = FighterDirection.Up
  private _blocksPos: [x: number, y: number][] = []

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

  public get pos(): [x: number, y: number] {
    return this._pos
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
    this.refreshPos()
  }

  public set dir(value: FighterDirection) {
    this._dir = value
  }

  public isReady(): boolean {
    return this._blocksPos.every(p => p.every(v => v >= 0) && p[0] < Board.width && p[1] < Board.height)
  }

  public putOn(board: Board) {
    this._blocksPos.forEach(p => {
      board.blockAt(p).use()
    })
    board.blockAt(this.pos).use(true)
  }

  public cleanFrom(board: Board) {
    this._blocksPos.forEach(p => {
      board.blockAt(p).clean()
    })
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
