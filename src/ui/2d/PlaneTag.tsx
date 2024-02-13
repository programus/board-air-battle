import './Plane.scss'
import { FighterDirection, FighterPlane } from '../../core'
import classNames from 'classnames'

interface PlaneProps {
  plane: FighterPlane,
  notLayoutReady?: boolean,
}

function PlaneTag({plane, notLayoutReady}: PlaneProps) {
  let transform = ''
  switch (plane.dir) {
    case FighterDirection.Up: {
      transform = `translate(${plane.pos[0] * 20 - 40}%, ${plane.pos[1] * 25}%) scaleX(-1)`
      break
    }
    case FighterDirection.Down: {
      transform = `rotate(180deg) translate(${-plane.pos[0] * 20 + 40}%, ${-plane.pos[1] * 25 + 75}%)`
      break
    }
    case FighterDirection.Left: {
      transform = `rotate(-90deg) translate(${-plane.pos[1] * 20 + 30}%, ${plane.pos[0] * 25 - 12.5}%)`
      break
    }
    case FighterDirection.Right: {
      transform = `rotate(90deg) translate(${plane.pos[1] * 20 - 30}%, ${-plane.pos[0] * 25 + 87.5}%) scaleX(-1)`
    }
  }

  console.log(transform)

  const tagClasses = classNames({
    'plane-moving': plane.moving,
    'plane-not-ready': !plane.isReady() || notLayoutReady,
  })
  return (
    <div className={tagClasses} style={{
      transform,
    }}> </div>
  )
}

export {
  PlaneTag,
  type PlaneProps,
}