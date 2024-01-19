import { useMemo } from 'react'
import { Block, HittedType, BoardState } from '../../core'
import './Block.css'
import classNames from 'classnames'

interface BlockProps {
  block: Block
}

function BlockTag({block}: BlockProps) {
  const rotation =  useMemo(() => Math.random() * 360, [])
  const blockClass = classNames({
    'covered': block.owner.state === BoardState.Fighting,
    'board-block': true,
    'plane-body': block.usedCount === 1,
    'not-ready': block.usedCount > 1,
    [`hitted-${HittedType[block.hittedType]}`]: true
  })
  const explodeClass = classNames({
    'explode-image': true,
    'hitted': [HittedType.PlaneBody, HittedType.PlaneCore].includes(block.hittedType),
  })
  return (
    <div className={blockClass}>
      <div className={explodeClass} style={{
        transform: `rotate(${rotation}deg)`,
      }}></div>
      {/* {block.toString()} */}
    </div>
  )
}

export { 
  BlockTag,
  type BlockProps,
}