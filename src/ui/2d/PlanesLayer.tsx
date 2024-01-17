import { PointerEvent, MouseEvent, useRef, useState } from 'react'
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

function PlanesLayer({board, onUpdated}: PlanesLayerProp) {
  const [,setUpdate] = useState({})
  const forceUpdate = () => setUpdate({})
  const {current: self} = useRef<{
    focusedPlane: FighterPlane|null,
    pressedPos: [number, number]|null,
    dragged: boolean,
    posOffset: [number, number],
  }>({
    focusedPlane: null,
    pressedPos: null,
    dragged: false,
    posOffset: [0, 0],
  })
  console.log(board.toString())

  const refresh = () => {
    forceUpdate()
    onUpdated && onUpdated()
  }

  function getBlockPosFromEvent(e: LayerTargetEvent<PointerEvent>): [x: number, y: number] {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = Math.floor((e.clientX - rect.x) * Board.width / rect.width)
      const y = Math.floor((e.clientY - rect.y) * Board.height / rect.height)
      return [x, y]
  }

  function generatePlane(pos: [x: number, y: number], board: Board): FighterPlane|null {
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

  const handlePointerDown = (e: LayerTargetEvent<PointerEvent>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    e.preventDefault()

    const blockPos = getBlockPosFromEvent(e)
    const planesAtPoint = board.getPlanes(blockPos)
    if (planesAtPoint.length > 0) {
      self.focusedPlane = planesAtPoint[planesAtPoint.length - 1]
      self.posOffset = self.focusedPlane.pos.map((v, i) => v - blockPos[i]) as [number, number]
      self.pressedPos = blockPos
    } else if (board.planes.filter(p => p.isReady()).length < Board.readyPlaneCount) {
      self.focusedPlane = generatePlane(blockPos, board)
    } else {
      e.currentTarget.releasePointerCapture(e.pointerId)
      // warn user max count
    }
    if (self.focusedPlane) {
      self.focusedPlane.moving = true
    }
    refresh()
    console.log(board.toString())
  }

  const handlePointerUp = (e: LayerTargetEvent<PointerEvent>) => {
    e.currentTarget.releasePointerCapture(e.pointerId)
    if (self.focusedPlane) {
      if (self.pressedPos && !self.dragged) {
        // rotate plane
        for (let i = 0; i < Object.values(FighterDirection).length; i++) {
          self.focusedPlane = self.focusedPlane.rotate(self.pressedPos)
          if (self.focusedPlane.isReady()) {
            break
          }
        }
      }
      self.focusedPlane.moving = false
      self.focusedPlane = null
    }
    board.cleanPlanes()
    refresh()
    self.pressedPos = null
    self.dragged = false
    console.log(board.toString())
  }

  const handlePointerMove = (e: LayerTargetEvent<PointerEvent>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      const blockPos = getBlockPosFromEvent(e)
      if (self.pressedPos && !areArrayEqual(blockPos, self.pressedPos)) {
        self.dragged = true
      }
      let needPlane = !self.focusedPlane
      if (self.focusedPlane) {
        self.focusedPlane.pos = blockPos.map((v, i) => v + self.posOffset[i]) as [number, number]
        if (!self.focusedPlane.isReady()) {
          needPlane = true
        }
      }
      if (needPlane) {
        self.focusedPlane = generatePlane(blockPos, board) || self.focusedPlane
      }
      if (self.focusedPlane) {
        self.focusedPlane.moving = true
      }
      refresh()
    }
  }

  const classes = classNames({
    'planes': true,
    'moving-plane': self.focusedPlane && self.focusedPlane.moving,
  })
  const planeReadiness = board.getPlaneReadiness()
  return (
    <div 
      className={classNames(classes)}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
    >
      {
        board.planes.map((plane, i) => (
          <PlaneTag key={i} plane={plane} notLayoutReady={!planeReadiness[plane.toString()]} />
        ))
      }
    </div>
  )

}


export {
  PlanesLayer,
  type PlanesLayerProp,
}