import { shuffle } from "."
import { Board } from "./Board"


class AiPlayer {
  private _possibleBoards: Board[] = []
  private _opponentBoard?: Board
  private _turnCount: number = 0
  private _hittedPosSet: Set<string> = new Set()
  constructor() {
  }

  // initialize player
  init() {
    this._possibleBoards = shuffle(Board.allPossible)
    this._turnCount = 0
    this._hittedPosSet = new Set()
  }

  // getter and setter of opponentBoard
  get opponentBoard(): Board|undefined {
    return this._opponentBoard
  }

  set opponentBoard(v: Board) {
    this._opponentBoard = v
  }

  // getter of possibleBoards
  get possibleBoards(): Board[] {
    return this._possibleBoards
  }

  // getter of turnCount
  get turnCount(): number {
    return this._turnCount
  }

  playTurn(turnCount: number): number {
    let count = 0
    for (; this._turnCount < turnCount; this._turnCount++) {
      const guessedBoard = this._possibleBoards[0]
      const pos = guessedBoard.planes.find(plane => !this._hittedPosSet.has(plane.pos.join(',')))?.pos || [Math.random() * Board.width, Math.random() * Board.height]
      this._hittedPosSet.add(pos.join(','))
      this._opponentBoard?.blockAt(pos).setHitted(true)
      const feedback = this._opponentBoard?.blockAt(pos).hittedType
      this._possibleBoards = this._possibleBoards.filter(board => {
        board.blockAt(pos).setHitted(true)
        const ret = board.blockAt(pos).hittedType === feedback
        board.blockAt(pos).setHitted(false)
        return ret
      })
      count++
    }
    return count
  }

  isWin() {
    return this._opponentBoard?.allPlanesKilled || false
  }
}

export { AiPlayer }