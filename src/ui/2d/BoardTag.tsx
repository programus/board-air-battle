import './Board.css'
import { Board } from '../../core';
import BlockTag from './BlockTag';

interface BoardProps {
  board: Board
}

function BoardTag({board}: BoardProps) {
  const blocks = board.blocks
  return (
    <div className='board'>
      {
        blocks.map((row, i) => (
          <div key={i} className='board-row'>{
            row.map((block, j) => <BlockTag key={`${i}-${j}`} block={block} />)
          }</div>)
        )
      }
    </div>
  )
}

export default BoardTag