import { Suspense, useMemo } from 'react'
import { Block, HittedType, BoardState } from '../../core'
import './Block.css'
import classNames from 'classnames'

interface BlockProps {
  block: Block
}

function BlockTag({block}: BlockProps) {
  const rotation =  useMemo(() => Math.random() * 360, [])
  const blockClass = classNames({
    'board-block': true,
    'covered': [BoardState.Analyzing, BoardState.Fighting].includes(block.owner.state) && !block.isHitted(),
  })
  const isPlaneBody = block.usedCount === 1
  const planeClass = classNames({
    'block-layer': true,
    'not-ready': block.usedCount > 1,
    'plane-body': isPlaneBody,
    [`hitted-${HittedType[block.hittedType]}`]: true,
  })
  const hittedImageMap: {[key: number]: string} = {
    [HittedType.PlaneBody]: 'explosions-body.svg',
    [HittedType.PlaneCore]: 'explosions-core.svg',
  }
  const imageFile = hittedImageMap[block.hittedType]
  return (
    <div className={blockClass}>
      <div className={planeClass}></div>
      <div className='block-layer explode-image'>
      {
        imageFile ?
          <Suspense>
            <object data={`images/2d/${imageFile}`} style={{
              transform: `rotate(${rotation}deg)`,
            }} />
          </Suspense>
        : <></>
      }
      </div>
      {/* {block.toString()} */}
    </div>
  )
}

export { 
  BlockTag,
  type BlockProps,
}