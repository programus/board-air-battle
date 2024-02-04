import './Board.scss'
import { Board } from '../../core';
import { BlockTag } from './BlockTag';
import { PlanesLayer } from './PlanesLayer';
import { useCallback, useState } from 'react';

interface BoardProps {
  board: Board,
  width?: string,
}

function BoardTag({board, width}: BoardProps) {
  const [,setUpdate] = useState({})
  const forceUpdate = useCallback(() => setUpdate({}), [])
  const blocks = board.blocks

  return (
    <>
      <div className='board-frame main-board' style={{
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