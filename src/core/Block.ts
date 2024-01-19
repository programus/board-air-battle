import {Board, areArrayEqual} from "."

enum HittedType {
  NotHitted,
  Empty,
  PlaneBody,
  PlaneCore,
}

class Block {
  private _owner: Board
  private _pos: [x: number, y: number]
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
    return this._owner.planes.map(plane => plane.blocksPos.filter(p => areArrayEqual(p, this._pos))).flat().length
  }


  public get planeCoreCount() {
    return this._owner.planes.filter(plane => areArrayEqual(plane.pos, this._pos)).length
  }

  public isPlaneCore() {
    return this.planeCoreCount > 0
  }

  public isReady() {
    return this.usedCount <= 1 && this.planeCoreCount <= 1
  }

  public isHitted(): boolean {
    return this._hitted
  }

  public setHitted(hitted?: boolean): boolean {
    const old = this._hitted
    this._hitted = (typeof hitted === 'undefined') || hitted
    return old
  }

  public get hittedType(): HittedType {
    const planeCore = this._owner.fixedPlanes.find(plane => areArrayEqual(plane.pos, this._pos))
    const planeBody = this._owner.fixedPlanes.find(plane => plane.blocksPos.find(p => areArrayEqual(p, this._pos)))
    return this._hitted ? (
      planeCore ? HittedType.PlaneCore : (
        planeBody ? HittedType.PlaneBody : HittedType.Empty
      )
    ) : HittedType.NotHitted
  }

  public toString(): string {
    const content = this.planeCoreCount ? ' ABCDEFG'[this.planeCoreCount] : (this.usedCount || ' ')
    return this._hitted ? `<${content}>` : content === ' ' ? ` ${content} ` : `[${content}]`
  }

}

export {
  HittedType,
  Block,
}