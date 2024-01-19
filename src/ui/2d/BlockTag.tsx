import { useMemo } from 'react'
import { Block, HittedType, BoardState } from '../../core'
import './Block.css'
import classNames from 'classnames'

interface BlockProps {
  block: Block
}

function BlockTag({block}: BlockProps) {
  const rotation =  useMemo(() => Math.floor(Math.random() * 4) * 90, [])
  const blockClass = classNames({
    'covered': block.owner.state === BoardState.Fighting,
    'board-block': true,
    'plane-body': block.usedCount === 1,
    'not-ready': block.usedCount > 1,
    [`hitted-${HittedType[block.hittedType]}`]: true
  })
  return (
    <div className={blockClass} style={{
      transform: `rotate(${rotation}deg)`,
    }}>
      {/* {block.toString()} */}
    </div>
  )
}

export { 
  BlockTag,
  type BlockProps,
}