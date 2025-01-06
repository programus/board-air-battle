import { Block, FighterPlane, areArrayEqual } from "."
import { FighterDirection } from './FighterPlane';
import { boards } from './boards'

enum BoardState {
  Preparing,
  Fighting,
  Watching,
  Analyzing,
  Over,
}

class Board {
  public static width = 10
  public static height = 10
  public static readyPlaneCount = 3

  private static planeStringDelimiter = '|'

  public static allPossible: Board[] = Board.backgroundGenerateAllPossibleBoards(100)

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

  /**
   * Generates all possible boards in the background, in chunks of the specified size.
   *
   * This method generates boards in chunks to avoid blocking the main thread. It continues
   * generating boards until all possible boards are generated. The generated boards are stored
   * in the static `Board.allPossible` array.
   *
   * @param size - The number of boards to generate in each chunk.
   * @returns An array of all possible boards.
   */
  private static backgroundGenerateAllPossibleBoards(size: number): Board[] {
    if (!Board.allPossible) {
      Board.allPossible = []
    }
    const boardsChunk = boards.slice(Board.allPossible.length, Board.allPossible.length + size)
    Board.allPossible.push(...boardsChunk.map(str => Board.generateBoard(str)))
    if (Board.allPossible.length < boards.length) {
      setTimeout(() => {
        Board.backgroundGenerateAllPossibleBoards(size)
      }, 0)
    } else {
      console.log('All possible boards generated')
    }
    return Board.allPossible
  }

  public static allPossibleBoardsGenerated(): boolean {
    return Board.allPossible.length === boards.length
  }

  public static pickRandomBoard(): Board {
    const index = Math.floor(Math.random() * boards.length)
    return Board.generateBoard(boards[index])
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

  public cleanPlanes(...planes: FighterPlane[]) {
    const filterFn = (plane: FighterPlane, i: number, a: FighterPlane[]) => plane.isReady() && !planes.find(p => p.equals(plane)) && a.findIndex(p => p.equals(plane)) === i
    if (this.useGuessPlanes) {
      this._guessPlanes = this._guessPlanes.filter(filterFn)
    } else {
      this._planes = this._planes.filter(filterFn)
    }
  }

  public addPlane(plane: FighterPlane) {
    if (!this.planes.find(p => p.equals(plane))) {
      this.planes.push(plane)
    }
  }

  public get planes() {
    return this.useGuessPlanes ? this._guessPlanes : this._planes
  }

  public get fixedPlanes() {
    return this._planes
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

  public get allPlanesKilled(): boolean {
    const blocksHitted = this._planes.map(plane => {
      const [x, y] = plane.pos
      const block = this._blocks[y][x]
      return block.isHitted()
    })
    return blocksHitted.every(v => v)
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
      result[curr.toString()] = !curr.blocksPos.find(p => notReadyPositions.find(np => areArrayEqual(p, np)))
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
    this._useGuessPlanes = null
    return `State: ${BoardState[this.state]}  Enemy: ${this.isEnemy}\n${maps[0].map((_, c) => maps.map(r => r[c]).join('  ')).join('\n')}`
  }
}

export {
  BoardState,
  Board,
}