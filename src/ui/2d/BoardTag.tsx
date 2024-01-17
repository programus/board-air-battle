import './Board.css'
import { Board } from '../../core';
import { BlockTag } from './BlockTag';
import { PlanesLayer } from './PlanesLayer';
import { useState } from 'react';
import { BoardState } from '../../core/Board';

interface BoardProps {
  board: Board,
  width: string,
}

function BoardTag({board, width}: BoardProps) {
  const [,setUpdate] = useState({})
  const forceUpdate = () => setUpdate({})
  const blocks = board.blocks

  return (
    <>
      <div className='control-bar'>
        <select 
          onChange={e => board.state = BoardState[e.target.value as keyof typeof BoardState]}
          defaultValue={board.state}
        >
          {
            Object.entries(BoardState).filter(([k, ]) => isNaN(Number(k))).map(([k, v], i) => (
              <option key={i} value={v}>{k}</option>
            ))
          }
        </select>
        <label>
          <input type='checkbox' 
            defaultChecked={board.isEnemy}
            onChange={e => board.isEnemy = e.target.checked}
          />Enemy
        </label>
      </div>
      <div className='board-frame' style={{
        width: width,
      }}>
        <div className='board'>
          {
            blocks.map((row, i) => (
              <div key={i} className='board-row'>{
                row.map((block, j) => <BlockTag key={`${i}-${j}`} block={block} />)
              }</div>)
            )
          }
        </div>
        <PlanesLayer board={board} onUpdated={forceUpdate} />
      </div>
    </>
  )
}

export {
  BoardTag,
  type BoardProps,
} 