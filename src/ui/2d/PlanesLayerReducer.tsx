import { Board, FighterPlane, FighterDirection, areArrayEqual, playEffect } from "../../core";
import { InteractEvent, BoardPlayState, Action, ActionType, HTMLElementType } from "./PlanesLayerDefs";

function getBlockPosFromEvent(e: InteractEvent, target: HTMLElementType): [x: number, y: number] {
    const rect = target.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.x) * Board.width / rect.width)
    const y = Math.floor((e.clientY - rect.y) * Board.height / rect.height)
    return [x, y]
}

function generatePlane(pos: [x: number, y: number]): FighterPlane|null {
  let plane: FighterPlane | null = null;
  Object.values(FighterDirection).find(dir => {
    const p = new FighterPlane(pos, dir)
    if (p.isReady()) {
      plane = new FighterPlane(pos, dir)
    }
    return p.isReady()
  })
  return plane
}

function pointerDownPreparing(state: BoardPlayState, {board, event, target}: Action): BoardPlayState {
  state = {...state, newPlane: null}
  target.setPointerCapture(event.pointerId)
  event.preventDefault()

  const blockPos = getBlockPosFromEvent(event, target)
  const planesAtPoint = board.getPlanes(blockPos)
  if (planesAtPoint.length > 0) {
    state.focusedPlane = planesAtPoint[planesAtPoint.length - 1]
    state.posOffset = state.focusedPlane.pos.map((v, i) => v - blockPos[i]) as [number, number]
    state.pressedPos = blockPos
  } else if (board.planes.filter(p => p.isReady()).length < Board.readyPlaneCount) {
    state.newPlane = state.focusedPlane = generatePlane(blockPos)
  } else {
    target.releasePointerCapture(event.pointerId)
    // warn user max count
  }
  if (state.focusedPlane) {
    state.focusedPlane.moving = true
  }
  return state
}

function pointerUpPreparing(state: BoardPlayState, {board, event, target}: Action): BoardPlayState {
  state = {...state, newPlane: null}
  target.releasePointerCapture(event.pointerId)
  if (state.focusedPlane) {
    if (state.pressedPos && !state.dragged) {
      // rotate plane
      const rotatedPlane = state.focusedPlane.clone()
      for (let i = 0; i < Object.values(FighterDirection).length; i++) {
        rotatedPlane.rotate(state.pressedPos)
        if (rotatedPlane.isReady()) {
          if (!state.focusedPlane.equals(rotatedPlane)) {
            state.removePlanes = [state.focusedPlane]
            state.newPlane = state.focusedPlane = rotatedPlane
          }
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
  return state
}

function pointerMovePreparing(state: BoardPlayState, {event, target}: Action): BoardPlayState {
  const captured = target.hasPointerCapture(event.pointerId)
  if (captured) {
    state = {...state, newPlane: null}
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
      state.newPlane = generatePlane(blockPos)
      state.focusedPlane = state.newPlane || state.focusedPlane
    }
    if (state.focusedPlane) {
      state.focusedPlane.moving = true
    }
  }
  return state
}

function pointerUpFighting(state: BoardPlayState, {board, event, target}: Action): BoardPlayState {
  const blockPos = getBlockPosFromEvent(event, target)
  const block = board.blockAt(blockPos)
  const hasBeenHitted = block.setHitted(true)
  if (!hasBeenHitted) {
    playEffect(block.hittedType)
  }
  return {...state}
}

function reducer(state: BoardPlayState, action: Action): BoardPlayState {
  let ret = state
  const { type, event } = action
  const eventType = event.type.toLowerCase()
  switch (type) {
    case ActionType.PreparingAction:
    case ActionType.AnalyzingAction: {
      const func = {
        pointerdown: pointerDownPreparing,
        pointerup: pointerUpPreparing,
        pointermove: pointerMovePreparing,
      }[eventType]
      if (func) {
        ret = func(state, action)
      }
      break
    }
    case ActionType.FightingAction: {
      if (eventType === 'pointerup') {
        ret = pointerUpFighting(state, action)
      }
    }
  }
  return ret
}

export {
  reducer,
}