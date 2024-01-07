import { Block, FighterPlane } from "."
import { FighterDirection } from './FighterPlane';
import boards from './boards'

export class Board {
  public static width = 10
  public static height = 10
  public static readyPlaneCount = 3

  private static planeStringDelimiter = '|'

  public static allPossible = boards.map(str => Board.generateBoard(str))

  private _blocks: Block[][]
  private _planes: FighterPlane[]

  constructor(planes?: FighterPlane[]) {
    this._blocks = [...Array(Board.height)].map((_, y) => [...Array(Board.width)].map((_, x) => new Block(this, [x, y])))
    this._planes = planes || []
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
          board.putPlanesOn()
          if (board.isLayoutReady()) {
            ret.push(board)
          }
        }
      }
    }

    return ret
  }

  public get planes() {
    return this._planes
  }

  public get blocks(): Block[][] {
    return this._blocks
  }

  public putPlanesOn() {
    this.planes.forEach(plane => plane.putOn(this))
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

  public getBlock(x: number, y: number): Block {
    return this._blocks[y][x]
  }

  public blockAt(p: [x: number, y: number]): Block {
    return this._blocks[p[1]][p[0]]
  }

  public toPlaneString(): string {
    const planes = [...this.planes].sort()
    return planes.map(plane => plane.toString()).join(Board.planeStringDelimiter)
  }

  public toString(): string {
    return [
      '  ' + [...Array(Board.width)].map((_, i) => `_${i}_`).join('') + ' ',
      this._blocks.map((row, i) => `${i}|${row.join('')}|`).join('\n'),
      ' +' + '-'.repeat(Board.width * 3) + '+',
    ].join('\n')
  }
}
