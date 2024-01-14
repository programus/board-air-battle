import { PointerEvent, MouseEvent, Component } from 'react'
import { Board, FighterDirection, FighterPlane, areArrayEqual } from '../../core'
import { PlaneTag } from './PlaneTag'
import './Plane.css'
import classNames from 'classnames'

interface PlanesLayerProp {
  board: Board,
  onUpdated?: () => void,
}

type TargetEvent<U, E> = (U extends PointerEvent ? PointerEvent<E> : MouseEvent<E>) & {currentTarget: E}
type LayerTargetEvent<T> = TargetEvent<T, HTMLDivElement>

class PlanesLayer extends Component<PlanesLayerProp> {

  private focusedPlane: FighterPlane|null
  private pressedPos: [number, number]|null = null
  private dragged: boolean = false
  private board: Board
  private posOffset: [number, number]

  constructor(props: PlanesLayerProp) {
    super(props)
    this.board = props.board
    this.focusedPlane = null
    this.posOffset = [0, 0]
    console.log(this.board.toString())
  }

  private refresh() {
    this.forceUpdate()
    this.props.onUpdated && this.props.onUpdated()
  }

  private getBlockPosFromEvent(e: LayerTargetEvent<PointerEvent>): [x: number, y: number] {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = Math.floor((e.clientX - rect.x) * Board.width / rect.width)
      const y = Math.floor((e.clientY - rect.y) * Board.height / rect.height)
      return [x, y]
  }

  private generatePlane(pos: [x: number, y: number], board: Board): FighterPlane|null {
    let plane: FighterPlane | null = null;
    Object.values(FighterDirection).find(dir => {
      const p = new FighterPlane(pos, dir)
      if (p.isReady()) {
        plane = new FighterPlane(pos, dir)
      }
      return p.isReady()
    })
    if (plane) {
      board.planes.push(plane)
      board.cleanPlanes()
    }
    return plane
  }

  private handlePointerDown = (e: LayerTargetEvent<PointerEvent>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    e.preventDefault()

    const blockPos = this.getBlockPosFromEvent(e)
    const planesAtPoint = this.board.getPlanes(blockPos)
    if (planesAtPoint.length > 0) {
      this.focusedPlane = planesAtPoint[planesAtPoint.length - 1]
      this.posOffset = this.focusedPlane.pos.map((v, i) => v - blockPos[i]) as [number, number]
      this.pressedPos = blockPos
    } else if (this.board.planes.filter(p => p.isReady()).length < Board.readyPlaneCount) {
      this.focusedPlane = this.generatePlane(blockPos, this.board)
    } else {
      e.currentTarget.releasePointerCapture(e.pointerId)
      // warn user max count
    }
    if (this.focusedPlane) {
      this.focusedPlane.moving = true
    }
    this.refresh()
    console.log(this.board.toString())
  }

  private handlePointerUp = (e: LayerTargetEvent<PointerEvent>) => {
    e.currentTarget.releasePointerCapture(e.pointerId)
    if (this.focusedPlane) {
      if (this.pressedPos && !this.dragged) {
        // rotate plane
        for (let i = 0; i < Object.values(FighterDirection).length; i++) {
          this.focusedPlane = this.focusedPlane.rotate(this.pressedPos)
          if (this.focusedPlane.isReady()) {
            break
          }
        }
      }
      this.focusedPlane.moving = false
      this.focusedPlane = null
    }
    this.board.cleanPlanes()
    this.refresh()
    this.pressedPos = null
    this.dragged = false
    console.log(this.board.toString())
  }

  private handlePointerMove = (e: LayerTargetEvent<PointerEvent>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      const blockPos = this.getBlockPosFromEvent(e)
      if (this.pressedPos && !areArrayEqual(blockPos, this.pressedPos)) {
        this.dragged = true
      }
      let needPlane = !this.focusedPlane
      if (this.focusedPlane) {
        this.focusedPlane.pos = blockPos.map((v, i) => v + this.posOffset[i]) as [number, number]
        if (!this.focusedPlane.isReady()) {
          needPlane = true
        }
      }
      if (needPlane) {
        this.focusedPlane = this.generatePlane(blockPos, this.board) || this.focusedPlane
      }
      console.log(this.focusedPlane)
      if (this.focusedPlane) {
        this.focusedPlane.moving = true
      }
      this.refresh()
    }
  }

  render() {
    const classes = classNames({
      'planes': true,
      'moving-plane': this.focusedPlane && this.focusedPlane.moving,
    })
    const planeReadiness = this.board.getPlaneReadiness()
    return (
      <div 
        className={classNames(classes)}
        onPointerDown={this.handlePointerDown}
        onPointerUp={this.handlePointerUp}
        onPointerMove={this.handlePointerMove}
      >
        {
          this.board.planes.map((plane, i) => (
            <PlaneTag key={i} plane={plane} notLayoutReady={!planeReadiness[plane.toString()]} />
          ))
        }
      </div>
    )
  }

}

export {
  PlanesLayer,
  type PlanesLayerProp,
}