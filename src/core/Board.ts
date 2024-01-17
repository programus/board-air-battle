import { Block, FighterPlane, areArrayEqual } from "."
import { FighterDirection } from './FighterPlane';
import { boards } from './boards'

enum BoardState {
  Preparing,
  Fighting,
  Analyzing,
  Over,
}

class Board {
  public static width = 10
  public static height = 10
  public static readyPlaneCount = 3

  private static planeStringDelimiter = '|'

  public static allPossible = boards.map(str => Board.generateBoard(str))

  private _blocks: Block[][]
  private _planes: FighterPlane[]
  private _guessPlanes: FighterPlane[]
  private _useGuessPlanes: boolean|null
  private _state: BoardState
  private _enemy: boolean

  constructor(planes?: FighterPlane[]) {
    this._blocks = [...Array(Board.height)].map((_, y) => [...Array(Board.width)].map((_, x) => new Block(this, [x, y])))
    this._planes = planes || []
    this._guessPlanes = []
    this._useGuessPlanes = null
    this._state = BoardState.Preparing
    this._enemy = false
  }

  public static generateBoard(planeString: string): Board {
    const planes = planeString.split(
      Board.planeStringDelimiter).map(
        v => FighterPlane.fromString(v)).filter(v => v !== null) as FighterPlane[]
    return new Board(planes)
  }

  public static generateAllBoards(): Board[] {
    const allPlanes = [...Array(Board.width)].map(
      (_, x) => [...Array(Board.height)].map(
        (_, y) => Object.values(FighterDirection).map(
          (dir) => new FighterPlane([x, y], dir)))).flat(2)
    const allPossiblePlanes = allPlanes.filter(plane => plane.isReady())

    const ret: Board[] = []
    for (let i = 0; i < allPossiblePlanes.length; i++) {
      for (let j = i + 1; j < allPossiblePlanes.length; j++) {
        for (let k = j + 1; k < allPossiblePlanes.length; k++) {
          const board = new Board([allPossiblePlanes[i], allPossiblePlanes[j], allPossiblePlanes[k]])
          if (board.isLayoutReady()) {
            ret.push(board)
          }
        }
      }
    }

    return ret
  }

  private get useGuessPlanes() {
    return this._useGuessPlanes !== null ? this._useGuessPlanes : (this.isEnemy && this.state !== BoardState.Over)
  }

  public cleanPlanes() {
    const filterFn = (plane: FighterPlane) => plane.isReady()
    if (this.useGuessPlanes) {
      this._guessPlanes = this._guessPlanes.filter(filterFn)
    } else {
      this._planes = this._planes.filter(filterFn)
    }
  }

  public get planes() {
    return this.useGuessPlanes ? this._guessPlanes : this._planes
  }

  public get blocks(): Block[][] {
    return this._blocks
  }

  public get state(): BoardState {
    return this._state
  }
  public set state(v: BoardState) {
    this._state = v
  }

  public get isEnemy(): boolean {
    return this._enemy
  }
  public set isEnemy(v: boolean) {
    this._enemy = v
  }

  public isLayoutReady(): boolean {
    const planeCountReady = this._planes.length === Board.readyPlaneCount
    const flatBlocks = this._blocks.flat()
    const blocksReady = flatBlocks.every(block => block.isReady())
    const usedCount = flatBlocks.map(block => block.usedCount).reduce((sum, value) => sum + value, 0)
    const coreCount = flatBlocks.map(block => block.planeCoreCount).reduce((sum, value) => sum + value)
    return [
      planeCountReady,
      blocksReady,
      usedCount === FighterPlane.blockCount * Board.readyPlaneCount,
      coreCount === Board.readyPlaneCount,
    ].every(v => v)

  }

  public blockAt(p: [x: number, y: number]): Block {
    return this._blocks[p[1]][p[0]]
  }

  public getPlanes(p: [x: number, y: number]): FighterPlane[] {
    return this.planes.filter(plane => plane.getBodyIndex(p) >= 0)
  }

  public getPlaneReadiness(): {[key: string]: boolean} {
    const notReadyPositions = this._blocks.flat().filter(block => block.usedCount > 1).map(block => block.position)
    return this.planes.reduce((result: {[key: string]: boolean}, curr) => {
      result[curr.toString()] = areArrayEqual(...notReadyPositions, curr.pos)
      return result
    }, {})
  }

  public toPlaneString(): string {
    const planes = [...this.planes].sort()
    return planes.map(plane => plane.toString()).join(Board.planeStringDelimiter)
  }

  public toString(): string {
    const maps = [false, true].map(v => {
      this._useGuessPlanes = v
      return [
        '  ' + [...Array(Board.width)].map((_, i) => `_${i}_`).join('') + ' ',
        ...this._blocks.map((row, i) => `${i}|${row.join('')}|`),
        ' +' + '-'.repeat(Board.width * 3) + '+',
      ]
    })
    return `State: ${BoardState[this.state]}  Enemy: ${this.isEnemy}
    ${maps[0].map((_, c) => maps.map(r => r[c]).join('  ')).join('\n')}`
  }
}

export {
  BoardState,
  Board,
}