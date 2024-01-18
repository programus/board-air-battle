import { useEffect, useReducer } from 'react'
import { Board, } from '../../core'
import { PlaneTag } from './PlaneTag'
import './Plane.css'
import classNames from 'classnames'
import { Action, ActionType, BoardPlayState, InteractEvent } from './PlanesLayerDefs'
import { reducer } from './PlanesLayerReducer'

interface PlanesLayerProp {
  board: Board,
  onUpdated?: () => void,
}

const initialState = {
  newPlane: null,
  focusedPlane: null,
  pressedPos: null,
  dragged: false,
  posOffset: [0, 0] as [number, number],
}

function PlanesLayer({board, onUpdated}: PlanesLayerProp) {
  const [state, dispatch] = useReducer<(prevState: BoardPlayState, action: Action) => BoardPlayState>(reducer, initialState)
  useEffect(() => {
    // add plane
    if (state.newPlane) {
      board.planes.push(state.newPlane)
      board.cleanPlanes()
    }
    console.log(board.toString())
    console.log(board.planes)
    // re-render parent
    onUpdated && onUpdated()
  }, [board, state, onUpdated])

  const handlePointerEvents = (e: InteractEvent) => {
    dispatch({
      type: ActionType.PreparingAction,
      board,
      event: e,
      target: e.currentTarget,
    })
  }

  const classes = classNames({
    'planes': true,
    'moving-plane': state.focusedPlane && state.focusedPlane.moving,
  })
  const planeReadiness = board.getPlaneReadiness()
  return (
    <div 
      className={classNames(classes)}
      onPointerDown={handlePointerEvents}
      onPointerUp={handlePointerEvents}
      onPointerMove={handlePointerEvents}
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