import { useMemo } from 'react'
import { Block, HittedType, BoardState } from '../../core'
import classNames from 'classnames'
import { isMobile } from 'react-device-detect'
import 'external-svg-loader'
import './Block.css'

interface BlockProps {
  block: Block
}

function BlockTag({block}: BlockProps) {
  const rotation =  useMemo(() => Math.random() * 360, [])
  const blockClass = classNames({
    'board-block': true,
    'covered': [BoardState.Analyzing, BoardState.Fighting].includes(block.owner.state) && !block.isHitted(),
  })
  const planeClass = classNames({
    'block-layer': true,
    'not-ready': block.usedCount > 1,
    'plane-body': block.usedCount === 1,
  })
  const hittedClass = classNames({
    'block-layer': true,
    'hitted-block': true,
    [`hitted-${HittedType[block.hittedType]}`]: true,
  })
  const hittedImageMap: {[key: number]: string} = {
    [HittedType.PlaneBody]: isMobile ? 'explosions-body.svg' : 'explosions-body-full.svg',
    [HittedType.PlaneCore]: isMobile ? 'explosions-core.svg' : 'explosions-core-full.svg',
  }
  const imageFile = hittedImageMap[block.hittedType]
  return (
    <div className={blockClass}>
      <div className={planeClass}></div>
      <div className={hittedClass}>
      {
        imageFile ?
          <svg
            data-src={`images/2d/${imageFile}`}
            data-cache={process.env.NODE_ENV === 'development' ? 'disabled' : null}
            width='100%'
            height='100%'
            style={{
              transform: `rotate(${rotation}deg)`,
            }}
          />
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