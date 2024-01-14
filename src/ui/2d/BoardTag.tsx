import './Board.css'
import { Board } from '../../core';
import { BlockTag } from './BlockTag';
import { PlanesLayer } from './PlanesLayer';
import { Component, ReactNode } from 'react';

interface BoardProps {
  board: Board,
  width: string,
}

class BoardTag extends Component<BoardProps> {
  private board: Board
  private width: string

  constructor(props: BoardProps) {
    super(props)
    this.board = props.board
    this.width = props.width
  }

  render(): ReactNode {
    const blocks = this.board.blocks

    return (
      <div className='board-frame' style={{
        width: this.width,
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
        <PlanesLayer board={this.board} onUpdated={() => this.forceUpdate()} />
      </div>
    )
  }
}

export {
  BoardTag,
  type BoardProps,
} 