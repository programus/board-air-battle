import { Board, FighterPlane, FighterDirection, areArrayEqual } from "../../core";
import { InteractEvent, BoardPlayState, Action, ActionType, HTMLElementType } from "./PlanesLayerDefs";


function getBlockPosFromEvent(e: InteractEvent, target: HTMLElementType): [x: number, y: number] {
    const rect = target.getBoundingClientRect()
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

function pointerDownPreparing(state: BoardPlayState, {board, event, target}: Action) {
  target.setPointerCapture(event.pointerId)
  event.preventDefault()

  const blockPos = getBlockPosFromEvent(event, target)
  const planesAtPoint = board.getPlanes(blockPos)
  if (planesAtPoint.length > 0) {
    state.focusedPlane = planesAtPoint[planesAtPoint.length - 1]
    state.posOffset = state.focusedPlane.pos.map((v, i) => v - blockPos[i]) as [number, number]
    state.pressedPos = blockPos
  } else if (board.planes.filter(p => p.isReady()).length < Board.readyPlaneCount) {
    state.focusedPlane = generatePlane(blockPos, board)
  } else {
    event.currentTarget.releasePointerCapture(event.pointerId)
    // warn user max count
  }
  if (state.focusedPlane) {
    state.focusedPlane.moving = true
  }
}

function pointerUpPreparing(state: BoardPlayState, {board, event, target}: Action) {
  target.releasePointerCapture(event.pointerId)
  if (state.focusedPlane) {
    if (state.pressedPos && !state.dragged) {
      // rotate plane
      for (let i = 0; i < Object.values(FighterDirection).length; i++) {
        state.focusedPlane = state.focusedPlane.rotate(state.pressedPos)
        if (state.focusedPlane.isReady()) {
          break
        }
      }
    }
    state.focusedPlane.moving = false
    state.focusedPlane = null
  }
  board.cleanPlanes()
  state.pressedPos = null
  state.dragged = false
}

function pointerMovePreparing(state: BoardPlayState, {board, event, target}: Action): boolean {
  const captured = target.hasPointerCapture(event.pointerId)
  if (captured) {
    const blockPos = getBlockPosFromEvent(event, target)
    if (state.pressedPos && !areArrayEqual(blockPos, state.pressedPos)) {
      state.dragged = true
    }
    let needPlane = !state.focusedPlane
    if (state.focusedPlane) {
      state.focusedPlane.pos = blockPos.map((v, i) => v + state.posOffset[i]) as [number, number]
      if (!state.focusedPlane.isReady()) {
        needPlane = true
      }
    }
    if (needPlane) {
      state.focusedPlane = generatePlane(blockPos, board) || state.focusedPlane
    }
    if (state.focusedPlane) {
      state.focusedPlane.moving = true
    }
  }
  return captured
}

function reducer(state: BoardPlayState, action: Action): BoardPlayState {
  let ret = state
  const { type, event } = action
  switch (type) {
    case ActionType.PreparingAction: {
      let changed = true
      const eventType = event.type.toLowerCase()
      if (eventType.includes('down')) {
        pointerDownPreparing(state, action)
      } else if (eventType.includes('up')) {
        pointerUpPreparing(state, action)
      } else if (eventType.includes('move')) {
        changed = pointerMovePreparing(state, action)
      }
      if (changed) {
        ret = {...state}
      }
    }
  }
  return ret
}

export {
  reducer,
}