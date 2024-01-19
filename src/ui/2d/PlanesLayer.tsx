import { useEffect, useReducer } from 'react'
import { Board, BoardState, } from '../../core'
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
  removePlanes: [],
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
      board.cleanPlanes(...state.removePlanes)
      board.addPlane(state.newPlane)
    }
    console.log(board.toString())
    // re-render parent
    onUpdated && onUpdated()
  }, [board, state, onUpdated])

  const handlePointerEvents = (e: InteractEvent) => {
    const actionMap: {[key: number]: ActionType} = {
      [BoardState.Preparing]: ActionType.PreparingAction,
      [BoardState.Fighting]: ActionType.FightingAction,
      [BoardState.Analyzing]: ActionType.AnalyzingAction,
    }

    if ((e.buttons & 0x01) === 1 || e.button === 0) {
      dispatch({
        type: actionMap[board.state],
        board,
        event: e,
        target: e.currentTarget,
      })
    }
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