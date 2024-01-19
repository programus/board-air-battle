import './Plane.css'
import { FighterDirection, FighterPlane } from '../../core'
import classNames from 'classnames'

interface PlaneProps {
  plane: FighterPlane,
  notLayoutReady?: boolean,
}

function PlaneTag({plane, notLayoutReady}: PlaneProps) {
  const directionClassMap = {
    [FighterDirection.Up]: 'plane-up',
    [FighterDirection.Down]: 'plane-down',
    [FighterDirection.Left]: 'plane-left',
    [FighterDirection.Right]: 'plane-right',
  }

  const tagClasses = classNames({
    [directionClassMap[plane.dir]]: true,
    'plane-moving': plane.moving,
    'plane-not-ready': !plane.isReady() || notLayoutReady,
  })
  return (
    <div className={tagClasses} style={{
      left: `${plane.pos[0] * 10}%`,
      top: `${plane.pos[1] * 10}%`,
    }}> </div>
  )
}

export {
  PlaneTag,
  type PlaneProps,
}