import { Board, FighterPlane } from '../../core'
import { PointerEvent, MouseEvent } from 'react'

type HTMLElementType = HTMLDivElement
type TargetEvent<U, E> = (U extends PointerEvent ? PointerEvent<E> : MouseEvent<E>) & {currentTarget: E}
type InteractEvent = TargetEvent<PointerEvent, HTMLElementType>

interface BoardPlayState {
  newPlane: FighterPlane|null,
  removePlanes: FighterPlane[],
  focusedPlane: FighterPlane|null,
  pressedPos: [number, number]|null,
  dragged: boolean,
  posOffset: [number, number],
}

interface Action {
  type: ActionType,
  board: Board,
  event: InteractEvent,
  target: HTMLElementType,
}

enum ActionType {
  PreparingAction,
}

export {
  type HTMLElementType,
  type InteractEvent,
  type BoardPlayState,
  type Action,
  ActionType,
}