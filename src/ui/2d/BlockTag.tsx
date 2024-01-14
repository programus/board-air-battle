import { Block } from '../../core'
import './Block.css'
import classNames from 'classnames'

interface BlockProps {
  block: Block
}

function BlockTag({block}: BlockProps) {
  const blockClass = classNames({
    'board-block': true,
    'hitted': block.isHitted(),
    'plane-body': block.usedCount == 1,
    'not-ready': block.usedCount > 1,
  })
  return (
    <div className={blockClass}>
      {/* {block.toString()} */}
    </div>
  )
}

export { 
  BlockTag,
  type BlockProps,
}