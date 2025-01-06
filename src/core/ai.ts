import { HittedType, shuffle } from "."
import { Board } from "./Board"

class AiPlayer {
  private _possibleBoards: Board[] = []
  private _opponentBoard?: Board
  private _turnCount: number = 0
  private _hittedPosSet: Set<string> = new Set()
  private _intellegentLevel: number = 1

  constructor() {
  }

  // initialize player
  init() {
    this._possibleBoards = shuffle(Board.allPossible)
    this._turnCount = 0
    this._hittedPosSet = new Set()
  }

  // getter and setter of intellegentLevel
  get intellegentLevel(): number {
    return this._intellegentLevel
  }

  set intellegentLevel(v: number) {
    this._intellegentLevel = Math.max(0, Math.min(2, v))
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

  generateRandomPos(): [number, number] {
    let pos = []
    do {
      const x = Math.floor(Math.random() * Board.width)
      const y = Math.floor(Math.random() * Board.height)
      pos = [x, y]
    } while (this._hittedPosSet.has(pos.join(',')));
    return pos as [number, number]
  }

  playTurn(turnCount: number, callback: (ai: AiPlayer, hittedType: HittedType) => void): number {
    let count = 0
    for (; this._turnCount < turnCount; this._turnCount++) {
      const guessedBoard = this._possibleBoards[0]
      const isCheating = this._intellegentLevel >= 2 && Math.random() < (this._intellegentLevel - 1) / 2
      console.log('%c%s%s', 'background: red;', 'AI is cheating:', isCheating)
      console.log('%c%s%d', 'background: #f88;', 'remain: ', this.possibleBoards.length)
      const pos = (isCheating ? this.opponentBoard?.planes.find(plane => !this._hittedPosSet.has(plane.pos.join(',')))?.pos : guessedBoard.planes.find(plane => !this._hittedPosSet.has(plane.pos.join(',')))?.pos) || this.generateRandomPos()
      console.log('%c%s', 'background: #f88;', pos)
      this._hittedPosSet.add(pos.join(','))
      this._opponentBoard?.blockAt(pos).setHitted(true)
      const feedback = this._opponentBoard?.blockAt(pos).hittedType
      this._possibleBoards = this._possibleBoards.filter(board => {
        let ret = this._intellegentLevel < 1 && Math.random() > this._intellegentLevel
        if (!ret) {
          board.blockAt(pos).setHitted(true)
          ret = board.blockAt(pos).hittedType === feedback
          board.blockAt(pos).setHitted(false)
        }
        return ret
      })
      if (callback) {
        callback(this, feedback!)
      }
      count++
    }
    return count
  }

  isWin() {
    return this._opponentBoard?.allPlanesKilled || false
  }
}

export { AiPlayer }