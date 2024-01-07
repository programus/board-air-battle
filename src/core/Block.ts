import {Board} from "."

class Block {
  private _owner: Board
  private _pos: [x: number, y: number]
  private _usedCount: number = 0
  private _planeCoreCount: number = 0
  private _hitted: boolean = false

  constructor(owner: Board, pos: [x: number, y: number]) {
    this._owner = owner
    this._pos = pos
  }

  public get owner() {
    return this._owner
  }

  public get position() {
    return this._pos
  }

  public get usedCount() {
    return this._usedCount
  }

  public set usedCount(value: number) {
    this._usedCount = value
  }

  public get planeCoreCount() {
    return this._planeCoreCount
  }

  public isPlaneCore() {
    return this._planeCoreCount > 0
  }

  public use(isPlaneCore?: boolean) {
    if (isPlaneCore) {
      this._planeCoreCount++
    } else {
      this._usedCount++
    }
  }

  public clean() {
    this._usedCount = Math.max(0, this._usedCount - 1)
    this._planeCoreCount = Math.max(0, this._planeCoreCount - 1)
  }

  public isReady() {
    return this._usedCount <= 1 && this._planeCoreCount <= 1
  }

  public isHitted(): boolean {
    return this._hitted
  }

  public setHitted(hitted?: boolean) {
    this._hitted = (typeof hitted === 'undefined') || hitted
  }

  public toString(): string {
    const content = this._planeCoreCount ? ' ABCDEFG'[this._planeCoreCount] : (this._usedCount || ' ')
    return this._hitted ? `<${content}>` : content === ' ' ? ` ${content} ` : `[${content}]`
  }

}

export default Block