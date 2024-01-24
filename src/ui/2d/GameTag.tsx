import { useState, useCallback } from "react";
import { Board, BoardState } from "../../core";
import { BoardTag } from "./BoardTag";
import './Game.scss'

interface GamePros {
  board: Board;
}

function GameTag ({ board }: GamePros) {
  const [,setUpdate] = useState({})
  const forceUpdate = useCallback(() => setUpdate({}), [])

  return (
    <div className="game-root">
      <div className='control-bar'>
        <select 
          onChange={e => {
            board.state = BoardState[e.target.value as keyof typeof BoardState]
            forceUpdate()
          }}
          defaultValue={board.state}
        >
          {
            Object.entries(BoardState).filter(([k, ]) => isNaN(Number(k))).map(([k, ], i) => (
              <option key={i} value={k}>{k}</option>
            ))
          }
        </select>
        <label>
          <input type='checkbox' 
            defaultChecked={board.isEnemy}
            onChange={e => {
              board.isEnemy = e.target.checked
              forceUpdate()
            }}
          />Enemy
        </label>
      </div>
      <BoardTag board={board} width="100%" />
    </div>
  )
}

export {
  type GamePros,
  GameTag,
}